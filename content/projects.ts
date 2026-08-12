// ---------------------------------------------------------------------------
// All site copy lives here. Edit this file to change content — you should not
// need to touch the components in /components or the pages in /app.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GitHub identity — single source of truth.
//
// Every github.com link on the site is derived from these two constants, so the
// handles cannot drift apart again. They already did once: the site shipped a
// link to "lkumar2925", which 404s because that account was renamed and GitHub
// does not redirect renamed profile URLs.
//
// Two constants rather than one because they are genuinely two accounts today.
// The profile is apex-likhithkumar (14 public repos, and the home of this
// portfolio's own source). The two linked project repos still live under the
// older work handle. Pointing them at PROFILE would 404, so the split stays
// explicit until the repos are transferred — at which point delete REPO_OWNER
// and every link follows PROFILE automatically.
// ---------------------------------------------------------------------------
const GITHUB_PROFILE = "apex-likhithkumar";
const GITHUB_REPO_OWNER = "apexneural-likhithmasura";

const repoUrl = (name: string) => `https://github.com/${GITHUB_REPO_OWNER}/${name}`;

export const site = {
  name: "Likhith Kumar Masura",
  role: "Forward-Deployed AI Engineer",
  location: "Hyderabad, India",
  email: "likhithmasura@gmail.com",
  github: `https://github.com/${GITHUB_PROFILE}`,
  linkedin: "https://www.linkedin.com/in/likhith-masura-2a1645208",
  // Drop your resume PDF into /public and this link works.
  resume: "/Likhith_Kumar_Masura_Forward_Deployed_AI_Engineer.pdf",

  // Portrait for the About section. Put the file in /public and set the path
  // here, e.g. "/portrait.jpg". While this is null the About column shows the
  // identity block alone — no broken image, no placeholder.
  portrait: null as string | null,

  statement:
    "I build LLM systems that have to survive contact with real users — multi-tenant conversational commerce, market-intelligence pipelines, and agents that operate software the way a person does.",

  // Keep this complementary to the pull quote on the About section, not a
  // restatement of it. An earlier version repeated the quote almost verbatim two
  // paragraphs later, which made the section read padded.
  intro: [
    "I work at ApexNeural as a forward-deployed engineer, which in practice means I sit close to the client, turn a vague problem into a spec, and stay on it until it is running in production.",
    "The habit I have picked up from that is auditing my own claims before someone else does. Two of the case studies here name a gap I found re-reading my own code for this write-up rather than quietly fixing the wording.",
  ],
};

// Hero signature: one real request through the Kalamandir pipeline.
// path: "det" = deterministic / cheap · "llm" = model call / expensive
export type TraceStage = {
  stage: string;
  detail: string;
  ms: number;
  path: "det" | "llm";
};

export const heroTrace: TraceStage[] = [
  { stage: "webhook.ingest", detail: "HMAC verified, enqueued", ms: 42, path: "det" },
  { stage: "lang.detect", detail: "hinglish + telugu script", ms: 9, path: "det" },
  { stage: "intent.decompose", detail: "multi-intent, 2 handlers", ms: 610, path: "llm" },
  { stage: "catalog.lookup", detail: "SKU exact match, no vector hop", ms: 24, path: "det" },
  { stage: "grounding.validate", detail: "3 product claims verified", ms: 15, path: "det" },
  { stage: "reply.compose", detail: "language mirrored", ms: 540, path: "llm" },
];

// "Most queries never reach the expensive path" was an unbacked empirical claim.
// The pipeline is BUILT to short-circuit — that is a design fact and safe to
// state. How often it actually does is a measurement, so it now carries its
// sample size and its limitation rather than being asserted.
export const traceNote =
  "Deterministic stages short-circuit before the model call: the expensive path is designed to be the exception, not the default. On a curated 58-prompt fixture of common queries, 48 resolved without a model call at all.";

export type Decision = { title: string; body: string };

/**
 * A measured result.
 *
 * Rules for filling these in, because a wrong number here costs more than no
 * number at all — an interviewer WILL ask how it was measured:
 *   - Only figures you actually measured. Never an estimate dressed as a metric.
 *   - `note` carries the measurement window or sample size. "over 30 days",
 *     "n=15 tasks". A figure without provenance reads as a guess.
 *   - Small honest samples beat impressive vague ones. "12 of 15 tasks" is more
 *     credible than "80% success rate" when n is 15 — and it says n out loud.
 *   - If you cannot source it, leave it out. The component renders nothing for
 *     an empty list, which is the honest failure mode.
 */
/**
 * A short extract of real code.
 *
 * Same discipline as Metric: it has to be genuine. An invented snippet that a
 * senior reads carefully is worse than no snippet, because it poisons every
 * other claim on the page. Trim imports and logging, never rewrite logic, and
 * if the extract has been abridged to the point where it would not run, say so
 * in `caveat` rather than quietly patching it.
 */
export type Snippet = {
  label: string;
  language: string;
  code: string;
  /** Repo-relative path and line range. This is what makes it checkable. */
  source: string;
  note: string;
  caveat?: string;
};

export type Metric = {
  /** The figure itself, pre-formatted: "92%", "1.2s", "4". */
  value: string;
  label: string;
  /** Measurement window or sample size. */
  note?: string;
};

// ---------------------------------------------------------------------------
// Architecture figures.
//
// Same colour semantics as the hero trace: "det" teal for deterministic work,
// "llm" indigo for a model call, "io" neutral for a system boundary you do not
// control. Keep steps named the way they are named in the codebase — a diagram
// with invented, prettier names is not evidence of anything.
//
// These describe systems in the author's own words. No client UI, screenshots
// or data appear here, which is what keeps the Kalamandir figure publishable.
// ---------------------------------------------------------------------------

export type DiagramStep = {
  label: string;
  path: "det" | "llm" | "io";
  /** Short qualifier shown dimmed after the label. */
  note?: string;
};

export type DiagramBand = {
  title: string;
  subtitle?: string;
  steps: DiagramStep[];
};

export type Diagram = {
  bands: DiagramBand[];
  /** Rendered as a feedback-loop line under the bands. */
  loop?: string;
  note?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  domain: string;
  period: string;
  role: string;
  team: string;
  summary: string;
  stack: string[];
  problem: string[];
  architecture: string[];
  diagram: Diagram;
  /** Empty until measured. See the Metric docblock before adding any. */
  metrics: Metric[];
  /** Real extracts only. See the Snippet docblock. */
  snippets: Snippet[];
  /** Public repository, when one exists. */
  repo?: string;
  /**
   * Shown in place of a repo link when the code cannot be public. Saying why
   * reads better than silently omitting it — a missing link on a client project
   * looks like an oversight, whereas "client codebase, private" looks like
   * someone who understands what they can and cannot publish.
   */
  repoNote?: string;
  decisions: Decision[];
  contribution: string[];
  outcome: string[];
};

export const projects: Project[] = [
  {
    slug: "kalamandir",
    index: "01",
    title: "Kalamandir",
    subtitle: "Multi-tenant omnichannel AI support and conversational commerce",
    domain: "Retail · conversational commerce",
    period: "Mar 2026 — present",
    role: "Forward-Deployed AI Engineer",
    team: "6 engineers",
    summary:
      "One deployment serves four retail brands across WhatsApp, Telegram, Instagram and web — product discovery, stock-checked ordering, payment links, order tracking, and escalation to a human when the agent should stop guessing.",
    stack: [
      "Python 3.11",
      "FastAPI",
      "Pydantic v2",
      "Anthropic Claude",
      "OpenRouter",
      "LiteLLM",
      "Langfuse",
      "EasyOCR",
      "NestJS",
      "PostgreSQL 16 (RLS)",
      "Redis 7",
      "BullMQ",
      "React 18",
      "Docker",
      "Terraform",
      "AWS ECS Fargate",
    ],
    problem: [
      "Four brands sit under one retail group. Each has its own catalogue, payment setup and support staff, and each was fielding the same questions on WhatsApp, Instagram, Telegram and the website — separately, by hand.",
      "Customers do not write clean queries. They send a photo of a saree instead of a name, they switch between English, Hindi, Hinglish, Telugu and Tenglish inside one sentence, and they ask three things at once. Festival season multiplies the volume without warning.",
      "The hard constraint: an assistant that invents a product, a price or a stock status is worse than no assistant at all. Retail support is a place where a confident hallucination costs real money and real trust.",
    ],
    architecture: [
      "A Python agent service owns conversation intelligence — language detection, multi-intent decomposition, and routing into intent handlers covering product discovery, checkout, payments, order status, returns and store location.",
      "A NestJS platform service owns tenants, catalogue sync, orders, operator tooling and RBAC. Channel providers hit a webhook that verifies the signature, enqueues, and returns 200 OK immediately; everything real happens on BullMQ workers behind schedulers for payment reconciliation, SLA scanning and abandoned-cart detection.",
      "Every model call goes through one provider-agnostic client, so Claude and OpenRouter models are swappable by environment variable, with LiteLLM attributing cost per call, per tenant and per model, and Langfuse tracing the whole conversation.",
    ],
    diagram: {
      bands: [
        {
          title: "Channels",
          subtitle: "provider webhooks",
          steps: [
            { label: "WhatsApp", path: "io" },
            { label: "Telegram", path: "io" },
            { label: "Instagram", path: "io" },
            { label: "Web", path: "io" },
          ],
        },
        {
          title: "Ingress · NestJS",
          subtitle: "acked inside 50ms",
          steps: [
            { label: "hmac.verify", path: "det" },
            { label: "enqueue", path: "det", note: "BullMQ" },
            { label: "200 OK", path: "det" },
          ],
        },
        {
          title: "Agent service · Python",
          subtitle: "conversation intelligence",
          steps: [
            { label: "lang.detect", path: "det" },
            { label: "intent.decompose", path: "llm" },
            { label: "catalog.lookup", path: "det", note: "exact" },
            { label: "vector.search", path: "llm", note: "fallback" },
            { label: "grounding.validate", path: "det" },
            { label: "reply.compose", path: "llm" },
          ],
        },
        {
          title: "Data · PostgreSQL 16",
          subtitle: "isolation fails closed",
          steps: [
            { label: "FORCE RLS", path: "det", note: "per tenant" },
            { label: "catalogue", path: "det" },
            { label: "orders", path: "det" },
            { label: "redis", path: "det", note: "cache" },
          ],
        },
        {
          title: "Model layer",
          subtitle: "provider-agnostic",
          steps: [
            { label: "Claude", path: "llm" },
            { label: "OpenRouter", path: "llm" },
            { label: "LiteLLM", path: "det", note: "cost/tenant" },
            { label: "Langfuse", path: "det", note: "traces" },
            { label: "rule-based NLU", path: "det", note: "breaker open" },
          ],
        },
      ],
      loop: "Circuit breaker trips the model layer to the rule-based path — a degraded answer now over a good answer never.",
      note: "The two retrieval steps are the decision worth noticing: an exact catalogue lookup runs first and vector similarity is the fallback, so the expensive path is the exception rather than the default.",
    },
    metrics: [
      {
        // Deliberately NOT phrased as "of inbound messages". The fixture was
        // curated for common queries, which selects for exactly the traffic that
        // hits cache and exact-match — production, with its long tail of photos,
        // odd phrasing and multi-intent messages, will run lower. The note says
        // so out loud so the figure cannot be read as a traffic sample.
        value: "82.8%",
        label: "of a 58-prompt common-query fixture resolved with no model call",
        note: "curated fixture, n=58 · Aug 2026 · not production traffic",
      },
    ],
    repoNote: "Client codebase — private.",
    snippets: [
      {
        label: "Transaction-scoped tenant context",
        language: "typescript",
        code: `async withTenantContext<T>(
  tenantId: string,
  work: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  return this.dataSource.transaction(async (manager) => {
    await manager.query(\`SELECT set_config('app.tenant_id', $1, true)\`, [
      tenantId,
    ]);
    return work(manager);
  });
}`,
        source: "apps/api/src/modules/conversations/conversations.service.ts:82-92",
        note:
          "The third argument to set_config is the whole security property. `true` makes the GUC transaction-local, so it dies with the transaction instead of riding a pooled connection into the next tenant's request.",
      },
      {
        label: "Pre-send hallucinated-SKU scrub",
        language: "python",
        code: `def _scrub_unknown_skus(
    response: str, backend_data: dict[str, Any], tenant_id: str | None = None
) -> str:
    products = backend_data.get("products") if isinstance(backend_data, dict) else None
    if not isinstance(products, list):
        return response
    real = {
        str(p.get("sku") or p.get("id") or "").strip().upper()
        for p in products
        if isinstance(p, dict)
    }
    real.discard("")
    # … tenant brand-pattern compilation elided; patterns = [SKU regex, brand regex]
    mentioned = {m.group(0).upper() for rx in patterns for m in rx.finditer(response)}
    bogus = mentioned - real
    if not bogus:
        return response

    def _replace(match: re.Match) -> str:
        return "" if match.group(0).upper() in bogus else match.group(0)

    scrubbed = response
    for rx in patterns:
        scrubbed = rx.sub(_replace, scrubbed)
    return scrubbed`,
        source: "app/services/response_generator.py:1460-1515",
        note:
          "It takes the set difference between SKUs the model wrote and SKUs the catalogue actually returned, then deletes the difference from the prose. The model is never trusted as the source of truth about which products exist.",
        caveat:
          "Abridged: the docstring, a logger call, four separator-cleanup substitutions and the tenant brand-pattern branch are elided at the marked line.",
      },
    ],
    decisions: [
      {
        title: "Two-stage retrieval instead of vector-first",
        body:
          "The obvious build is: embed everything, search semantically. But most real queries carry an exact handle — a SKU, a barcode, a product name lifted straight from the website. So a cheap deterministic lookup runs first and vector similarity is the fallback, not the default. Semantic search is the expensive path, so it should be the exception.",
      },
      {
        title: "Row-level security in the database, not tenant filters in the code",
        body:
          "Application-level tenant filtering works until one query forgets its WHERE clause. Pushing isolation into PostgreSQL with FORCE ROW LEVEL SECURITY plus USING and WITH CHECK policies means a missing filter fails closed instead of leaking. The subtlety is connection pooling: tenant context has to be transaction-scoped, because session-wide state on a pooled connection is exactly how a cross-tenant leak happens.",
      },
      {
        title: "Ground every claim, then validate before sending",
        body:
          "Prompting a model not to hallucinate is a hope, not a control. Product facts are injected from the live catalogue, and a validator runs over the drafted reply before it leaves — any product assertion that cannot be matched back to the catalogue gets stripped. Grounding reduces the problem; the pre-send check is what makes it enforceable.",
      },
      {
        title: "Degrade to rule-based NLU rather than hang",
        body:
          "When a model provider is slow or down, the worst outcome is a customer watching a typing indicator forever. Circuit breakers trip to a rule-based intent path that handles the common cases badly but instantly. A degraded answer now beats a good answer never.",
      },
      {
        title: "Accept-and-enqueue webhooks",
        body:
          "Channel providers retry aggressively and time out fast. Verifying the signature, enqueueing and acknowledging inside 50ms means a traffic spike or a slow downstream never turns into lost messages — and handlers can be idempotent with backoff retries because they are no longer racing a provider timeout.",
      },
    ],
    contribution: [
      "This is a six-engineer platform and I am not going to claim all of it. My work concentrated on the Python agent service: intent handling, retrieval and grounding, the multilingual path, and the observability layer over model calls.",
      "I built the LLM cost and reliability instrumentation — per-call, per-tenant and per-model spend attribution, conversation-level latency and resolution rollups, and structured failure traces you can query by cause rather than grep.",
      "I designed the provider-agnostic model layer and its circuit-breaker fallback. On tenant isolation and the queue architecture I contributed alongside the platform engineers rather than owning the design.",
      "The team works test-first: pytest and pytest-asyncio suites behind a coverage gate in CI, and every bug gets a failing test before it gets a fix.",
    ],
    outcome: [
      "Four brands run from one deployment, and onboarding a fifth on a different commerce backend is a configuration change rather than a code change.",
      "Customers can send a photo instead of a description and get a real product back, in whichever of five languages or scripts they wrote in.",
      "The part I would defend hardest in an interview is unglamorous: you can ask this system what a conversation cost, which stage was slow, and why it said what it said.",
    ],
  },

  {
    slug: "dbaas",
    index: "02",
    title: "DBaaS",
    subtitle: "Pain-point mining to market-gap engine",
    domain: "SaaS · market research",
    period: "2025 — 2026",
    role: "Backend Engineer, AI systems",
    team: "Small product team",
    summary:
      "An AI backend that reads unstructured discussion — text and Reddit threads — for the complaints people actually repeat, then ranks the gaps worth building into and expands the survivors against established strategy frameworks.",
    stack: [
      "Python",
      "FastAPI",
      "Claude 3.5 Sonnet via OpenRouter",
      "Pydantic",
      "async Python",
      "web scraping",
      "REST APIs",
    ],
    problem: [
      "Idea validation usually runs on vibes and a few conversations. Meanwhile the internet is full of people describing their problems in detail, for free, at a volume no founder can read.",
      "The hard part is not summarising threads. It is telling a genuine recurring pain point apart from one loud complaint, and producing something structured enough for a product decision instead of another wall of prose.",
    ],
    architecture: [
      "Scraping and research pipelines pull discussion data, then LLM stages extract candidate pain points, cluster and rank them by signal strength, and expand the strongest into opportunity write-ups against known strategic frameworks.",
      "Each stage is a separate agent-shaped module behind REST endpoints for text analysis, file processing and live workflows, so a stage can be changed or re-run without disturbing the rest of the chain.",
    ],
    diagram: {
      bands: [
        {
          title: "Sources",
          subtitle: "unstructured discussion",
          steps: [
            { label: "Reddit threads", path: "io" },
            { label: "raw text", path: "io" },
            { label: "uploaded files", path: "io" },
          ],
        },
        {
          title: "Ingest",
          // Figures are the configured defaults in the code, not the result of a
          // measured run. Stated as design, never as throughput.
          steps: [
            { label: "scrape.collect", path: "det", note: "30 results" },
            { label: "normalize", path: "det" },
            { label: "schema.validate", path: "det", note: "enforced" },
          ],
        },
        {
          title: "Extract",
          subtitle: "candidate pain points",
          steps: [
            { label: "painpoint.extract", path: "llm" },
            { label: "schema.validate", path: "det", note: "gap — not enforced" },
          ],
        },
        {
          title: "Rank",
          subtitle: "cheap filter before spend",
          steps: [
            { label: "cluster", path: "det" },
            { label: "signal.rank", path: "det", note: "top 10" },
          ],
        },
        {
          title: "Expand",
          subtitle: "survivors only",
          steps: [
            { label: "opportunity.expand", path: "llm" },
            { label: "framework.apply", path: "llm" },
            { label: "schema.validate", path: "det", note: "gap — swallowed" },
          ],
        },
      ],
      note: "Ranking sits before generation on purpose: 30 candidates collected, 10 survive to expansion, so two thirds are discarded before anything expensive runs. Those are the configured defaults rather than measured throughput. The validation steps are marked honestly — enforced at ingest, where a bad post re-raises, and currently swallowed at both model seams.",
    },
    metrics: [],
    repo: repoUrl("dbaas-backup"),
    decisions: [
      {
        title: "Schema at every boundary — enforced at ingest, still open at the model seams",
        body:
          "LLM stages chained together fail in a specific way: stage two receives something almost-shaped-right from stage one and quietly produces nonsense. The intent was a Pydantic model on every boundary. Auditing it for this write-up, that is true at ingest — a post that fails ExtractedDataModel re-raises and never reaches the LLM stages — but not at the model seams. The pain-point extractor returns json.loads output directly, and the market-gap stage wraps its one Pydantic boundary in a bare except that logs and passes the unvalidated JSON downstream. So the discipline is real at the edge where data enters and absent exactly where I claimed it mattered most. Closing that is a small change and a failing test, and it is the first thing I would do on this codebase.",
      },
      {
        title: "Ranking before generation, not after",
        body:
          "It is tempting to generate rich write-ups for everything and let the user sort it out. Ranking first — cheaply, on signal strength — means expensive generation only runs on candidates that earned it. The same cost instinct as retrieval: make the cheap filter do the work.",
      },
      {
        title: "Modular agents over one large prompt",
        body:
          "A single prompt that extracts, ranks and expands is easier to write and impossible to debug. Splitting the chain into modules made each stage independently testable and let a bad output be traced to one step.",
      },
    ],
    contribution: [
      "I built the backend: the FastAPI services, the LLM reasoning and evaluation stages, the Reddit research pipeline, and the Pydantic validation layer across service boundaries.",
      "Worth being straight about scope — this is a product built by a small team, and my ownership was the backend and AI layer rather than the whole product.",
    ],
    outcome: [
      "Unstructured discussion becomes ranked, structured opportunity data that a person can actually act on.",
      "The validation discipline is the part that generalised — though re-reading the code for this write-up is what taught me the difference between intending it and enforcing it. It holds at ingest and lapses at the model seams, which is precisely the boundary I would tell someone else to guard hardest.",
    ],
    snippets: [
      {
        label: "Schema enforced at the ingest boundary",
        language: "python",
        code: `class ExtractedDataModel(BaseModel):
    post: PostModel                        # title: str, content: str = ""
    comments: List[CommentModel]           # body: str
    total_comments: int = Field(..., description="Total number of comments extracted")
    source_file: Optional[str] = Field(None, description="Source JSON file path")

try:
    for post_data in posts_to_process:
        post_model = PostModel(
            title=post_data['post']['title'],
            content=post_data['post'].get('content', ''),
        )
        comments_models = [CommentModel(body=c['body']) for c in post_data['comments']]
        extracted = ExtractedDataModel(
            post=post_model,
            comments=comments_models,
            total_comments=post_data['total_comments'],
            source_file=json_file,
        )
        all_extracted_data.append(extracted)
except Exception as e:
    raise`,
        source: "app/data_extraction/json_extraction.py:53-58, 301-342",
        note:
          "The except re-raises instead of substituting a default, so a post that fails validation never reaches the LLM stages as a half-populated dict. This is the boundary where the discipline actually holds — the model seams downstream do not do this yet, which the case study says plainly.",
        caveat:
          "Abridged. Note also that PostModel's pre-validator coerces a missing title to an empty string, so absent titles pass rather than raising — another place the fail-loud intent is softer than it reads.",
      },
    ],
  },

  {
    slug: "computer-using-agent",
    index: "03",
    title: "Computer-Using Agent",
    subtitle: "A desktop agent that works from pixels, under a human-in-the-loop safety contract",
    domain: "Agents · research build",
    period: "Personal build",
    role: "Sole author",
    team: "Solo",
    summary:
      "A working prototype that operates a real computer using only what it can see on screen and the mouse and keyboard — no DOM access, no application APIs, no integration hooks. It plans exactly one action at a time, routes every action through a human-approval gate, and persists each cycle for replay.",
    stack: [
      "Python",
      "vision LLM",
      "screen capture",
      "OS input control",
      "structured UI schema",
      "audit logging",
    ],
    problem: [
      "Most automation is welded to an integration surface. It reads the DOM, calls an API, or drives a framework hook — and it breaks the moment the surface moves, and never works at all on software that offers no surface.",
      "The question I wanted to answer: if an agent is restricted to exactly what a person gets — pixels on a screen, a mouse and a keyboard — can it still be reliable enough to trust?",
    ],
    architecture: [
      "The loop is deliberately narrow. Capture the screen, convert the pixels into a structured UI schema, plan one atomic action, run it through a central safety contract, execute it deterministically, then compare the before and after screens to confirm the action did what it claimed.",
      "Every cycle is persisted — the observation, the plan, the action, the verification — so any run can be audited or replayed step by step.",
      "Perception is GPT-4.1 called with the screenshot as a base64 PNG, temperature 0 and a forced JSON response, parsed into a strict six-key UI schema: screen_summary, visible_elements, text_regions, clickable_candidates, scrollable_areas and cursor, with every element carrying an x/y/width/height bounding box. Unexpected top-level keys raise rather than being ignored, so a drifting model response fails at the parse instead of halfway through a click.",
    ],
    diagram: {
      bands: [
        {
          title: "Observe",
          subtitle: "pixels only",
          steps: [
            { label: "screen.capture", path: "io" },
            { label: "ui.parse", path: "llm", note: "vision" },
            { label: "schema.validate", path: "det" },
          ],
        },
        {
          title: "Plan",
          subtitle: "one atomic action",
          steps: [
            { label: "action.plan", path: "llm" },
            { label: "action.classify", path: "det" },
          ],
        },
        {
          title: "Safety contract",
          subtitle: "single chokepoint",
          steps: [
            { label: "policy.check", path: "det" },
            { label: "human.approve", path: "io", note: "if sensitive" },
          ],
        },
        {
          title: "Execute",
          subtitle: "deterministic",
          steps: [
            { label: "mouse.move", path: "det" },
            { label: "keyboard.type", path: "det" },
          ],
        },
        {
          title: "Verify",
          subtitle: "against the screen, not the plan",
          steps: [
            { label: "screen.diff", path: "det" },
            { label: "cycle.persist", path: "det", note: "replayable" },
          ],
        },
      ],
      loop: "Verified state becomes the next observation — one action per cycle, so the agent cannot drift far from reality before someone notices.",
      note: "Every action funnels through one safety chokepoint rather than per-handler checks. Scattered safety rules are the ones that get forgotten in the next handler.",
    },
    metrics: [],
    repo: repoUrl("CUA-Computer-Using-agent"),
    snippets: [
      {
        label: "The safety chokepoint",
        language: "python",
        code: `TRIGGER_KEYWORDS = ("login", "log in", "sign in", "signin", "submit", "send", "delete")

def requires_approval(action: Dict[str, Any], vision_state: Dict[str, Any]) -> bool:
    for field in ("label", "text", "key"):
        value = action.get(field)
        if isinstance(value, str) and _contains_trigger(value):
            return True
    action_name = action.get("action")
    if action_name in {"click", "type", "press"}:
        for text in _extract_texts(vision_state):
            if text and _contains_trigger(text):
                return True
    return False

# ---- the gate, agent/loop.py ----
if requires_approval(action, vision_state):
    record_failure("approval_required")
    return {"status": "approval_required", "action": action, "vision": vision_state}`,
        source: "agent/safety.py:6, 28-41 · agent/loop.py:26-28",
        note:
          "The gate fails closed — it returns before any mouse or keyboard call is reachable. But the classification it depends on is keyword matching over the vision model's own generated text, so what counts as \"sensitive\" is decided by model output rather than by anything verified about the real screen. A mislabelled button is a hole, and that is the weakness I would close first.",
      },
    ],
    decisions: [
      {
        title: "Vision only, on purpose",
        body:
          "Refusing DOM access and application APIs costs accuracy and speed. It buys generality: the agent has no per-application integration to maintain, so it is not privileged on the software it was tested against. That trade is the entire premise of the build.",
      },
      {
        title: "Exactly one atomic action per decision cycle",
        body:
          "Letting a model emit an action sequence is faster and much harder to reason about — when a five-step plan fails at step three, you are guessing about state. One action per cycle, each verified against the screen, means the agent cannot drift far from reality before someone notices.",
      },
      {
        title: "One central safety contract, not scattered checks",
        body:
          "Safety rules sprinkled through handlers are safety rules that get forgotten in the next handler. Every action passes through a single chokepoint that classifies it and requires explicit human approval for sensitive operations. One place to read, one place to audit.",
      },
      {
        title: "Verify by comparing screens, not by trusting the plan",
        body:
          "A click that lands on nothing looks identical to a click that worked, if you only consult your own intentions. Diffing the screen before and after turns a silent no-op into a caught failure.",
      },
      {
        title: "No self-learning, no stealth",
        body:
          "The build explicitly excludes unsupervised behaviour and anything designed to look like a human to evade detection. An agent that quietly rewrites its own policy is an agent whose logs no longer explain it — and explainability was the requirement I was least willing to trade.",
      },
    ],
    contribution: [
      "Sole author. The design constraints, the perception-to-schema step, the planning loop, the safety contract and the audit log are all mine.",
    ],
    outcome: [
      "What exists is two artefacts, and they are worth keeping distinct. One persisted cycle against VS Code, logged as successful. Separately, a state file recording three steps completed and a halt with failure_reason \"approval_required\". The gate demonstrably fires and the loop demonstrably persists its work — but they are not one continuous narrated run, and stitching them into one would be the kind of small embellishment this page exists to avoid. One application, no task suite.",
      "It is a research build rather than a product, and I would rather present it that way. What it demonstrates is a position on agent design: determinism, auditability and a human in the loop over autonomy for its own sake. What it does not yet demonstrate is reliability across applications, which would take a task suite and a lot more runs than one.",
    ],
  },
];

export const stack = [
  {
    label: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    label: "AI / ML",
    items: [
      "LLM application development",
      "RAG",
      "agentic workflows",
      "prompt and context engineering",
      "multi-intent classification",
      "retrieval grounding and guardrails",
      "embeddings and vector search",
      "vision LLMs and OCR",
      "LLM evaluation",
    ],
  },
  {
    label: "Model tooling",
    items: ["Anthropic Claude", "OpenAI", "OpenRouter", "LiteLLM", "Langfuse", "EasyOCR / Tesseract"],
  },
  {
    label: "Backend",
    items: [
      "FastAPI",
      "Pydantic v2",
      "NestJS",
      "REST APIs",
      "async workers",
      "webhook ingestion",
      "JWT / OAuth2",
      "RBAC",
      "SQLAlchemy",
    ],
  },
  {
    label: "Data",
    items: ["PostgreSQL (row-level security)", "Redis", "BullMQ", "vector embeddings"],
  },
  {
    label: "Cloud and DevOps",
    items: [
      "AWS (ECS Fargate, RDS, ElastiCache, S3, CloudFront)",
      "Docker",
      "Terraform",
      "CI/CD (Jenkins, GitHub Actions)",
      "Git",
    ],
  },
  {
    label: "Testing",
    items: ["pytest", "Jest", "Playwright", "k6", "test-driven development"],
  },
];

export const education = [
  {
    school: "Vellore Institute of Technology",
    degree: "M.Tech, Computer Science (ML & AI)",
    meta: "2024 — 2026 · CGPA 9.55 / 10",
  },
  {
    school: "JNTU Hyderabad",
    degree: "B.Tech, Computer Science (AI & ML)",
    meta: "2020 — 2024 · CGPA 7.99 / 10",
  },
];
