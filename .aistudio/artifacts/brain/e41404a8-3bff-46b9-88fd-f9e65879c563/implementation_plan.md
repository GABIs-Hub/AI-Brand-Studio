# Algorithmic Foundations & Architecture Plan: GABI

A rigorous breakdown of the mathematical, computer science, and machine learning algorithms utilized, planned, rejected, and recommended for GABI (Generate, Align, Build, Inspire). This specification focuses strictly on underlying algorithmic mechanisms, data structures, and mathematical formulations, omitting commercial brand names.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Decisions from Phase 1:**
> - **Scope & Depth:** Full-stack CS and ML algorithms across all domains (Color Science, Natural Language, Computer Vision, Cryptography, Geometry, Retrieval, and Systems).
> - **Delivery Format:** Dual delivery consisting of this architectural plan artifact and an exhaustive technical reference document (`ALGORITHMS.md`) accompanied by a comprehensive breakdown.
> - **Terminology Constraint:** Strict focus on mathematical principles, model architectures, and algorithms rather than commercial provider names.

---

## 1. Overview & Algorithmic Landscape

GABI operates at the intersection of seven distinct algorithmic disciplines:
1. **Colorimetry & Photometry:** Spectral power distribution approximation, relative luminance, perceptual color spaces (OKLCH, CIELAB), and contrast optimization.
2. **Computational Geometry & Vector Synthesis:** Polar coordinate mapping, Bézier curve interpolation, golden ratio spiral generation, and SVG polygon tessellation.
3. **Autoregressive Sequence Modeling:** Multi-head scaled dot-product attention, Rotary Positional Embeddings (RoPE), top-$p$ nucleus sampling, and Chain-of-Thought search trees.
4. **Continuous-Time Diffusion & Flow Matching:** Latent Diffusion Models (LDM), score-based generative modeling, rectified flow matching, and ordinary differential equation (ODE) trajectory solvers.
5. **Cryptography & Security:** Adaptive key derivation functions (bcrypt), cryptographically secure pseudo-random number generation (CSPRNG), constant-time string equality, and sliding-window rate limiting.
6. **Vector Search & Information Retrieval:** Approximate Nearest Neighbor (ANN) search via Hierarchical Navigable Small World (HNSW) graphs and cosine similarity in dense embedding spaces.
7. **Typographic Mathematics:** Exponential modular scales, baseline grid alignment, and font metrics normalization.

---

## 2. Comprehensive Algorithmic Taxonomy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              GABI ALGORITHMIC TAXONOMY                                 │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ 1. IN ACTIVE USE         │ 2. SCHEDULED FOR USE      │ 3. REJECTED / DEPRECATED        │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ • WCAG 2.1 Luminance     │ • CIEDE2000 Color Diff    │ • RGB Euclidean Distance        │
│ • sRGB <-> OKLCH Matrices│ • HNSW Vector Indexing    │ • SHA-256 for Passwords         │
│ • Modular Type Scaling   │ • Flow Matching ODE Solve │ • Levenshtein for Semantics     │
│ • Cubic Bézier Curves    │ • MinHash / LSH Shingling │ • GANs for Image Synthesis      │
│ • bcrypt (Cost = 12)     │ • Token Bucket Traffic    │ • Recurrent Neural Nets (RNN)   │
│ • Sliding Window Counter │ • Ast-based HTML/CSS Diffs│ • Fixed Window Rate Limiting    │
│ • Autoregressive MHA/GQA │ • Cosine Semantic Rank    │ • Plain Heuristic Contrast      │
│ • Latent Diffusion / RFM │ • Speculative Decoding    │ • Simple Grid Brute Force       │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

---

## 3. Deep-Dive Domain Breakdowns

### 3.1 Color Science, Optics & Accessibility
* **Currently Used:**
  * **Gamma Expansion Function:** Converts non-linear 8-bit sRGB values to linear photometric values:
    $$C_{linear} = \begin{cases} \frac{C_{sRGB}}{12.92} & \text{if } C_{sRGB} \le 0.04045 \\ \left(\frac{C_{sRGB} + 0.055}{1.055}\right)^{2.4} & \text{otherwise} \end{cases}$$
  * **Relative Photometric Luminance ($Y$):** Calculated according to CIE 1931 standard observer weights ($L = 0.2126 R_{lin} + 0.7152 G_{lin} + 0.0722 B_{lin}$).
  * **WCAG 2.1 Contrast Ratio Formula:**
    $$\text{Ratio} = \frac{L_{lighter} + 0.05}{L_{darker} + 0.05} \quad (\text{yielding values from } 1.0 \text{ to } 21.0)$$
  * **OKLCH Color Space Transforms:** Conversion via $3 \times 3$ linear matrix transformation to cone fundamentals (LMS), cube-root non-linearity, projection to Cartesian Oklab ($L, a, b$), and conversion to polar coordinates ($C = \sqrt{a^2 + b^2}, H = \text{atan2}(b, a)$).
* **Scheduled for Implementation:**
  * **CIEDE2000 Color Difference Equation ($\Delta E_{00}$):** Compensates for perceptual non-uniformities in chroma, hue, and lightness interactions across complex palettes.
  * **APCA (Advanced Perceptual Contrast Algorithm):** Modern lightness-contrast model based on spatial frequency, ambient adaptation, and polarity-dependent human vision (W3C Silver/WCAG 3 preview).
* **Algorithms Rejected:**
  * *Standard Euclidean Distance in RGB:* $\sqrt{(R_1-R_2)^2 + (G_1-G_2)^2 + (B_1-B_2)^2}$ fails human perceptual uniformity (human vision has extreme green sensitivity and low blue spatial resolution).

---

### 3.2 Computational Geometry & Procedural Logo Synthesis
* **Currently Used:**
  * **Bézier Path Interpolation:** Parametric cubic Bézier curves:
    $$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3, \quad t \in [0, 1]$$
  * **Polar-to-Cartesian Coordinate Projection:** For radial wordmarks, badges, and symmetric geometric emblems ($x = r \cos \theta, y = r \sin \theta$).
  * **Fibonacci Spiral & Golden Section Ratio ($\phi = \frac{1 + \sqrt{5}}{2} \approx 1.618$):** Governs spatial proportioning between mark emblems, wordmark baseline clearance, and padding bounding boxes.
  * **Fowler–Noll–Vo (FNV-1a) Hash-Seeded PRNG:** Deterministic procedural logo and palette generator that maps the brand name string into an integer seed to guarantee repeatable procedural generation without network requests.
* **Scheduled for Implementation:**
  * **Convex Hull (Graham Scan / Monotone Chain):** Automatic minimum clearance boundary computation for irregular logo shapes.
  * **Voronoi Diagram & Delaunay Triangulation:** Dynamic geometric pattern generation for abstract brand backgrounds.
* **Algorithms Rejected:**
  * *Pixel-based Rasterization & Thresholding (Marching Squares):* Inefficient for pure branding vector assets where resolution independence is mandatory.

---

### 3.3 Natural Language Processing & Strategic Reasoning
* **Currently Used (Underlying Architectures):**
  * **Autoregressive Decoder-Only Transformer Architecture:** Stacked self-attention blocks with causal masking to predict token distributions $P(w_t | w_{<t})$.
  * **Scaled Dot-Product Attention:**
    $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
  * **Grouped-Query Attention (GQA) & FlashAttention:** Reduces memory bandwidth during sequence generation.
  * **Rotary Position Embeddings (RoPE):** Encodes relative token distance using orthogonal rotation matrices.
  * **Stochastic Decoding Strategies:**
    * *Top-$p$ (Nucleus) Sampling:* Dynamic threshold cutoff where $\sum_{i \in V^{(p)}} P(w_i) \ge p$.
    * *Temperature Scaling:* Modulates logit sharpness ($z_i / T$) before softmax normalization.
  * **Chain-of-Thought (CoT) Prompt Graphing:** Multi-stage reasoning decomposes brand strategy into vision, competitive differentiation, visual metaphors, and voice guidelines sequentially.
* **Scheduled for Implementation:**
  * **Constrained Context-Free Grammar (CFG) / JSON Schema Masking:** Enforces strict deterministic schema compliance at the logit level during autoregressive decoding.
* **Algorithms Rejected:**
  * *Recurrent Neural Networks (LSTM/GRU):* Inability to attend across long document contexts (Brand Bibles exceed 4,000 tokens) and sequential execution bottlenecks.
  * *Greedy Argmax Decoding:* Results in repetitive, generic brand prose without creative divergence.

---

### 3.4 Image Synthesis & Motion Video
* **Currently Used (Underlying Architectures):**
  * **Latent Diffusion Models (LDM):** Operates diffusion forward-noising and reverse-denoising processes inside a low-dimensional perceptual latent space learned by a regularized autoencoder.
  * **Rectified Flow Matching (RFM):** Linear transport ODE between noise and data distribution ($\frac{dx_t}{dt} = v_t(x_t)$), replacing curved curved diffusion trajectories with straight velocity paths for faster, sharper image generation.
  * **Cross-Attention Conditioning:** Text prompts are encoded into dense sequence vectors and injected into latent feature maps via spatial cross-attention layers.
  * **Numerical Solvers:** DPM-Solver++ (2M) and Euler Ancestral multistep ODE integration.
* **Scheduled for Implementation:**
  * **Latent Consistency Models (LCM) / Few-step Distillation:** Reduces synthesis from 25–50 steps down to 2–4 steps for instantaneous UI mockups.
* **Algorithms Rejected:**
  * *Generative Adversarial Networks (GANs):* Mode collapse, inability to follow complex prompt instructions, and training instability across broad visual domains.

---

### 3.5 Cryptography, Authentication & Traffic Protection
* **Currently Used:**
  * **bcrypt Adaptive Key Derivation Function:** Salted, multi-round Blowfish-based key stretching algorithm ($2^{12} = 4096$ iterations) resistant to hardware/ASIC acceleration.
  * **CSPRNG (Cryptographically Secure Pseudo-Random Number Generation):** Entropy-backed pseudorandom bytes for session tokens and single-use verification identifiers.
  * **Constant-Time Comparison (`crypto.timingSafeEqual`):** Prevents microsecond timing side-channel attacks during hash and token verification.
  * **Sliding Window Counter Rate Limiting:**
    * Tracks timestamped request intervals per client IP.
    * Smooths boundary spikes that defeat traditional fixed-window counters.
    * Background epoch garbage collector cleans inactive IP buckets every 120,000 ms.
* **Scheduled for Implementation:**
  * **Argon2id Key Derivation:** Winner of the Password Hashing Competition; incorporates both memory-hardness (preventing GPU parallel attacks) and data-dependent time penalties.
  * **Token Bucket Algorithm with Redis:** Replaces single-instance in-memory map for distributed cluster rate-limiting.
* **Algorithms Rejected:**
  * *MD5, SHA-1, and Unsalted SHA-256 for Credentials:* Subject to rainbow-table lookup and billion-hash/second GPU dictionary attacks.
  * *Fixed-Window Rate Limiting:* Vulnerable to twice the burst capacity at window boundaries.

---

### 3.6 Semantic Search & Vector Embeddings (Planned)
* **Scheduled for Implementation:**
  * **Cosine Similarity Metric:**
    $$\text{sim}(u, v) = \frac{u \cdot v}{\|u\| \|v\|}$$
  * **Hierarchical Navigable Small World (HNSW) Graphs:** Multi-layer skip-list graph algorithm providing logarithmic $\mathcal{O}(\log N)$ approximate nearest neighbor search over competitor brand vectors.
  * **MinHash & Locality-Sensitive Hashing (LSH):** Rapid detection of brand name collisions and trademark phonetics.
* **Algorithms Rejected:**
  * *Exact Brute-Force $k$-NN ($O(N \cdot D)$):* Fails to scale as historical brand database grows.
  * *Levenshtein / Edit Distance Alone:* Measures typographical spelling variations but completely misses conceptual or semantic similarity (e.g., "Apex" vs. "Summit").

---

## 4. Execution & Artifact Roadmap

1. **Step 1: Write `ALGORITHMS.md` in Repository Root:**
   - Create a dedicated, clean markdown file documenting every mathematical formula, time/space complexity class ($\mathcal{O}$ notation), pseudocode snippets, and architectural trade-offs.
2. **Step 2: Deliver Comprehensive In-Chat Explanation:**
   - Present a clear, well-structured breakdown directly in conversation detailing all four requested quadrants:
     1. Algorithms Currently Used
     2. Algorithms Scheduled for Use
     3. Algorithms NOT to Use (and Why)
     4. Best-in-Class Algorithmic Recommendations for Each Domain
