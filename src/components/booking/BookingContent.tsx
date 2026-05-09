     1|"use client";
     2|
     3|import { useState, useEffect } from "react";
     4|import { supabase, type Slot } from "@/lib/supabase";
     5|import {
     6|  CLOSED_DAYS,
     7|  TIME_SLOT_LABELS,
     8|  PLAN_LABELS,
     9|  PLAN_MAX_GUESTS,
    10|  formatDateDisplay,
    11|  type TimeSlot,
    12|} from "@/lib/booking";
    13|import { PLANS } from "@/lib/constants";
    14|import { Container } from "@/components/ui/Container";
    15|import { FadeIn } from "@/components/ui/FadeIn";
    16|import { Link } from "@/i18n/navigation";
    17|import { ChevronLeft, ChevronRight, Check } from "lucide-react";
    18|
    19|type Step = "date" | "details" | "done";
    20|
    21|type FormState = {
    22|  date: string;
    23|  time_slot: TimeSlot | "";
    24|  plan: string;
    25|  guests: number;
    26|  name: string;
    27|  email: string;
    28|  seating: "floor" | "chair" | "";
    29|  dietary: string;
    30|  notes: string;
    31|};
    32|
    33|const EMPTY_FORM: FormState = {
    34|  date: "",
    35|  time_slot: "",
    36|  plan: "",
    37|  guests: 1,
    38|  name: "",
    39|  email: "",
    40|  seating: "",
    41|  dietary: "",
    42|  notes: "",
    43|};
    44|
    45|export function BookingContent() {
    46|  const [step, setStep] = useState<Step>("date");
    47|  const [form, setForm] = useState<FormState>(EMPTY_FORM);
    48|  const [slots, setSlots] = useState<Slot[]>([]);
    49|  const [calendarMonth, setCalendarMonth] = useState(() => {
    50|    const now = new Date();
    51|    return new Date(now.getFullYear(), now.getMonth(), 1);
    52|  });
    53|  const [submitting, setSubmitting] = useState(false);
    54|  const [error, setError] = useState("");
    55|
    56|  // Load open slots for the visible month range
    57|  useEffect(() => {
    58|    const year = calendarMonth.getFullYear();
    59|    const month = calendarMonth.getMonth();
    60|    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    61|    const nextMonth = new Date(year, month + 2, 0);
    62|    const to = `${year}-${String(month + 1).padStart(2, "0")}-${nextMonth.getDate()}`;
    63|
    64|    supabase
    65|      .from("available_slots")
    66|      .select("*")
    67|      .gte("date", from)
    68|      .lte("date", to)
    69|      .eq("is_open", true)
    70|      .then(({ data }) => {
    71|        if (data) setSlots(data as Slot[]);
    72|      });
    73|  }, [calendarMonth]);
    74|
    75|  // Calendar helpers
    76|  const year = calendarMonth.getFullYear();
    77|  const month = calendarMonth.getMonth();
    78|  const firstDay = new Date(year, month, 1).getDay();
    79|  const daysInMonth = new Date(year, month + 1, 0).getDate();
    80|  const today = new Date();
    81|  today.setHours(0, 0, 0, 0);
    82|
    83|  function openSlotsForDate(dateStr: string) {
    84|    return slots.filter((s) => s.date === dateStr);
    85|  }
    86|
    87|  function padDay(d: number) {
    88|    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    89|  }
    90|
    91|  function isDayAvailable(d: number) {
    92|    const dateStr = padDay(d);
    93|    const date = new Date(dateStr + "T00:00:00");
    94|    if (CLOSED_DAYS.includes(date.getDay())) return false;
    95|    if (date < today) return false;
    96|    return openSlotsForDate(dateStr).length > 0;
    97|  }
    98|
    99|  const selectedDateSlots = form.date ? openSlotsForDate(form.date) : [];
   100|
   101|  // Filtered guest options by plan
   102|  const maxGuests = form.plan ? PLAN_MAX_GUESTS[form.plan] ?? 6 : 6;
   103|
   104|  async function handleSubmit(e: React.FormEvent) {
   105|    e.preventDefault();
   106|    setError("");
   107|    setSubmitting(true);
   108|
   109|    try {
   110|      const res = await fetch("/api/bookings", {
   111|        method: "POST",
   112|        headers: { "Content-Type": "application/json" },
   113|        body: JSON.stringify(form),
   114|      });
   115|
   116|      if (!res.ok) {
   117|        const data = await res.json();
   118|        throw new Error(data.error || "Something went wrong");
   119|      }
   120|
   121|      setStep("done");
   122|    } catch (err) {
   123|      setError(err instanceof Error ? err.message : "Something went wrong");
   124|    } finally {
   125|      setSubmitting(false);
   126|    }
   127|  }
   128|
   129|  // ── DONE ────────────────────────────────────────────────────────────────────
   130|  if (step === "done") {
   131|    return (
   132|      <div className="bg-paper pt-20 sm:pt-24">
   133|        <section className="py-24 sm:py-32">
   134|          <Container>
   135|            <FadeIn>
   136|              <div className="mx-auto max-w-2xl text-center">
   137|                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-clay">
   138|                  <Check size={32} className="text-ink" />
   139|                </div>
   140|                <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium text-ink sm:text-5xl">
   141|                  Request received.
   142|                </h1>
   143|                <p className="mt-6 text-lg leading-relaxed text-ink/75">
   144|                  We'll confirm your reservation at{" "}
   145|                  <span className="text-ink">{form.email}</span> within 24
   146|                  hours. If your date is unavailable, we'll suggest the nearest
   147|                  alternative.
   148|                </p>
   149|                <div className="mt-10 border-t border-border pt-8 text-sm text-ink-muted">
   150|                  <p>{formatDateDisplay(form.date)} at {form.time_slot}</p>
   151|                  <p className="mt-1">{PLAN_LABELS[form.plan]}</p>
   152|                  <p className="mt-1">{form.guests} guest{form.guests > 1 ? "s" : ""} · {form.seating === "floor" ? "Floor (tatami)" : "Chair"}</p>
   153|                </div>
   154|                <Link
   155|                  href="/"
   156|                  className="mt-10 inline-block border border-border px-7 py-3.5 text-sm uppercase tracking-[0.15em] text-ink/70 transition-colors hover:border-clay hover:text-clay"
   157|                >
   158|                  Back to home
   159|                </Link>
   160|              </div>
   161|            </FadeIn>
   162|          </Container>
   163|        </section>
   164|      </div>
   165|    );
   166|  }
   167|
   168|  // ── STEP 1: Date + Time ──────────────────────────────────────────────────────
   169|  const stepDate = (
   170|    <div className="bg-paper pt-20 sm:pt-24">
   171|      <section className="py-16 sm:py-24">
   172|        <Container>
   173|          <FadeIn>
   174|            <div className="mx-auto max-w-3xl">
   175|              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-clay sm:text-sm">
   176|                Reserve
   177|              </p>
   178|              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] text-ink sm:text-5xl md:text-6xl">
   179|                Choose a date.
   180|              </h1>
   181|              <p className="mt-4 text-base text-ink-muted">
   182|                We're open Tuesday through Saturday. Select any highlighted day.
   183|              </p>
   184|
   185|              {/* Calendar */}
   186|              <div className="mt-10 border border-border bg-paper-dark p-5 sm:p-7">
   187|                {/* Month nav */}
   188|                <div className="mb-5 flex items-center justify-between">
   189|                  <button
   190|                    onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
   191|                    disabled={new Date(year, month, 1) <= today}
   192|                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay disabled:opacity-30"
   193|                  >
   194|                    <ChevronLeft size={18} />
   195|                  </button>
   196|                  <span className="font-[family-name:var(--font-heading)] text-lg font-medium text-ink">
   197|                    {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
   198|                  </span>
   199|                  <button
   200|                    onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
   201|                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay"
   202|                  >
   203|                    <ChevronRight size={18} />
   204|                  </button>
   205|                </div>
   206|
   207|                {/* Day headers */}
   208|                <div className="mb-2 grid grid-cols-7 text-center">
   209|                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
   210|                    <div key={d} className="py-1 text-xs tracking-wide text-ink/35">
   211|                      {d}
   212|                    </div>
   213|                  ))}
   214|                </div>
   215|
   216|                {/* Days */}
   217|                <div className="grid grid-cols-7">
   218|                  {Array.from({ length: firstDay }).map((_, i) => (
   219|                    <div key={`empty-${i}`} />
   220|                  ))}
   221|                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
   222|                    const dateStr = padDay(d);
   223|                    const available = isDayAvailable(d);
   224|                    const selected = form.date === dateStr;
   225|                    const date = new Date(dateStr + "T00:00:00");
   226|                    const closed = CLOSED_DAYS.includes(date.getDay()) || date < today;
   227|
   228|                    return (
   229|                      <button
   230|                        key={d}
   231|                        disabled={!available}
   232|                        onClick={() => setForm((f) => ({ ...f, date: dateStr, time_slot: "" }))}
   233|                        className={`
   234|                          aspect-square flex items-center justify-center text-sm transition-colors
   235|                          ${selected ? "bg-ink text-paper font-medium" : ""}
   236|                          ${!selected && available ? "text-ink hover:bg-clay/40 hover:text-clay cursor-pointer" : ""}
   237|                          ${closed || !available ? "text-ink/20 cursor-default" : ""}
   238|                        `}
   239|                      >
   240|                        {d}
   241|                      </button>
   242|                    );
   243|                  })}
   244|                </div>
   245|              </div>
   246|
   247|              {/* Time slots */}
   248|              {form.date && (
   249|                <FadeIn>
   250|                  <div className="mt-8">
   251|                    <p className="mb-4 text-sm uppercase tracking-[0.15em] text-clay">
   252|                      {formatDateDisplay(form.date)}
   253|                    </p>
   254|                    <div className="grid gap-3 sm:grid-cols-3">
   255|                      {selectedDateSlots.map((slot) => (
   256|                        <button
   257|                          key={slot.time_slot}
   258|                          onClick={() => setForm((f) => ({ ...f, time_slot: slot.time_slot as TimeSlot }))}
   259|                          className={`border py-4 text-center text-sm transition-colors ${
   260|                            form.time_slot === slot.time_slot
   261|                              ? "border-clay bg-clay/20 text-ink"
   262|                              : "border-border text-ink/70 hover:border-clay hover:text-ink"
   263|                          }`}
   264|                        >
   265|                          {TIME_SLOT_LABELS[slot.time_slot as TimeSlot]}
   266|                        </button>
   267|                      ))}
   268|                    </div>
   269|                  </div>
   270|                </FadeIn>
   271|              )}
   272|
   273|              {/* Next */}
   274|              <div className="mt-10">
   275|                <button
   276|                  disabled={!form.date || !form.time_slot}
   277|                  onClick={() => setStep("details")}
   278|                  className="bg-ink px-9 py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed"
   279|                >
   280|                  Continue →
   281|                </button>
   282|              </div>
   283|            </div>
   284|          </FadeIn>
   285|        </Container>
   286|      </section>
   287|    </div>
   288|  );
   289|
   290|  // ── STEP 2: Details form ─────────────────────────────────────────────────────
   291|  const stepDetails = (
   292|    <div className="bg-paper pt-20 sm:pt-24">
   293|      <section className="py-16 sm:py-24">
   294|        <Container>
   295|          <FadeIn>
   296|            <div className="mx-auto max-w-2xl">
   297|              <button
   298|                onClick={() => setStep("date")}
   299|                className="mb-8 flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-clay"
   300|              >
   301|                <ChevronLeft size={14} /> Change date
   302|              </button>
   303|
   304|              <div className="mb-8 border border-clay/30 bg-clay/10 px-5 py-4">
   305|                <p className="text-sm text-ink/70">
   306|                  {formatDateDisplay(form.date)} at{" "}
   307|                  <span className="text-ink">{form.time_slot}</span>
   308|                </p>
   309|              </div>
   310|
   311|              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium text-ink sm:text-5xl">
   312|                Your details.
   313|              </h1>
   314|
   315|              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
   316|                {/* Plan */}
   317|                <div>
   318|                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
   319|                    Experience plan *
   320|                  </label>
   321|                  <div className="grid gap-3">
   322|                    {PLANS.map((plan) => {
   323|                      const key = plan.id;
   324|                      return (
   325|                        <button
   326|                          type="button"
   327|                          key={key}
   328|                          onClick={() =>
   329|                            setForm((f) => ({
   330|                              ...f,
   331|                              plan: key,
   332|                              guests: Math.min(f.guests, PLAN_MAX_GUESTS[key]),
   333|                            }))
   334|                          }
   335|                          className={`flex items-start justify-between border p-4 text-left transition-colors ${
   336|                            form.plan === key
   337|                              ? "border-clay bg-clay/15"
   338|                              : "border-border hover:border-cream/30"
   339|                          }`}
   340|                        >
   341|                          <div>
   342|                            <p className="text-sm font-medium text-ink">
   343|                              {PLAN_LABELS[key].split(" — ")[0]}
   344|                            </p>
   345|                            <p className="mt-0.5 text-xs text-ink-muted">
   346|                              {PLAN_LABELS[key].split(" — ")[1]}
   347|                            </p>
   348|                          </div>
   349|                          {form.plan === key && (
   350|                            <Check size={16} className="mt-0.5 shrink-0 text-clay" />
   351|                          )}
   352|                        </button>
   353|                      );
   354|                    })}
   355|                  </div>
   356|                </div>
   357|
   358|                {/* Guests */}
   359|                <div>
   360|                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
   361|                    Number of guests *
   362|                  </label>
   363|                  <div className="flex gap-2">
   364|                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
   365|                      <button
   366|                        type="button"
   367|                        key={n}
   368|                        onClick={() => setForm((f) => ({ ...f, guests: n }))}
   369|                        className={`h-10 w-10 border text-sm transition-colors ${
   370|                          form.guests === n
   371|                            ? "border-clay bg-ink text-paper"
   372|                            : "border-border text-ink/70 hover:border-clay hover:text-ink"
   373|                        }`}
   374|                      >
   375|                        {n}
   376|                      </button>
   377|                    ))}
   378|                  </div>
   379|                </div>
   380|
   381|                {/* Name */}
   382|                <div>
   383|                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
   384|                    Your name *
   385|                  </label>
   386|                  <input
   387|                    required
   388|                    value={form.name}
   389|                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
   390|                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
   391|                    placeholder="Full name"
   392|                  />
   393|                </div>
   394|
   395|                {/* Email */}
   396|                <div>
   397|                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
   398|                    Email address *
   399|                  </label>
   400|                  <input
   401|                    required
   402|                    type="email"
   403|                    value={form.email}
   404|                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
   405|                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
   406|                    placeholder="you@example.com"
   407|                  />
   408|                </div>
   409|
   410|                {/* Seating */}
   411|                <div>
   412|                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
   413|                    Seating preference *
   414|                  </label>
   415|                  <div className="grid grid-cols-2 gap-3">
   416|                    {(["floor", "chair"] as const).map((s) => (
   417|                      <button
   418|                        type="button"
   419|                        key={s}
   420|                        onClick={() => setForm((f) => ({ ...f, seating: s }))}
   421|                        className={`border py-3.5 text-center text-sm transition-colors ${
   422|                          form.seating === s
   423|                            ? "border-clay bg-clay/15 text-ink"
   424|                            : "border-border text-ink-muted hover:border-cream/30"
   425|                        }`}
   426|                      >
   427|                        {s === "floor" ? "Floor (tatami)" : "Chair"}
   428|                      </button>
   429|                    ))}
   430|                  </div>
   431|                </div>
   432|
   433|                {/* Dietary */}
   434|                <div>
   435|                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
   436|                    Dietary restrictions / allergies
   437|                    <span className="ml-2 normal-case tracking-normal text-ink-muted">
   438|                      — optional
   439|                    </span>
   440|                  </label>
   441|                  <input
   442|                    value={form.dietary}
   443|                    onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
   444|                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
   445|                    placeholder="e.g. nut allergy, vegetarian"
   446|                  />
   447|                </div>
   448|
   449|                {/* Notes */}
   450|                <div>
   451|                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
   452|                    Anything else we should know
   453|                    <span className="ml-2 normal-case tracking-normal text-ink-muted">
   454|                      — optional
   455|                    </span>
   456|                  </label>
   457|                  <textarea
   458|                    rows={3}
   459|                    value={form.notes}
   460|                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
   461|                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
   462|                    placeholder="Accessibility needs, questions, etc."
   463|                  />
   464|                </div>
   465|
   466|                {error && (
   467|                  <p className="text-sm text-red-400">{error}</p>
   468|                )}
   469|
   470|                <button
   471|                  type="submit"
   472|                  disabled={
   473|                    submitting ||
   474|                    !form.plan ||
   475|                    !form.name ||
   476|                    !form.email ||
   477|                    !form.seating
   478|                  }
   479|                  className="w-full bg-ink py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed"
   480|                >
   481|                  {submitting ? "Sending…" : "Send reservation request"}
   482|                </button>
   483|
   484|                <p className="text-center text-xs text-ink-muted">
   485|                  We confirm by hand within 24 hours. No charge until we send a payment link.
   486|                </p>
   487|              </form>
   488|            </div>
   489|          </FadeIn>
   490|        </Container>
   491|      </section>
   492|    </div>
   493|  );
   494|
   495|  return step === "date" ? stepDate : stepDetails;
   496|}
   497|