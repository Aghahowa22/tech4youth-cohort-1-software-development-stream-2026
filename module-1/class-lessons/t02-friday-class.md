# **Module 1 - Friday Classes (Topic 02)**
## **Web Development Essentials: HTML, CSS, and Accessibility**

---

## **Class Schedule Overview**

| Date                      | Lesson | Topic                                       | Duration |
| ------------------------- | ------ | ------------------------------------------- | -------- |
| **Sep 20, 2026** (Friday) | **L1** | Tools Setup & Semantic HTML Fundamentals    | 2 hours  |
| **Sep 20, 2026** (Friday) | **L2** | Styling with CSS - Layout & Design          | 2 hours  |
| **Sep 20, 2026** (Friday) | **L3** | Web Accessibility (WCAG) & Inclusive Design | 2 hours  |

---

## **Topic 02 - Learning Objectives**

By the end of this topic, learners will be able to:

- ✅ Set up a professional web development environment (text editor, browser tools, local files)
- ✅ Understand and write semantic HTML that conveys meaning to browsers and assistive technologies
- ✅ Structure web pages using landmark elements (header, nav, main, footer, aside, section, article)
- ✅ Build logical heading hierarchies without skipping levels or misusing headings for style
- ✅ Write accessible links, images (with alt text), tables, and forms
- ✅ Create forms with properly associated labels and descriptive instructions
- ✅ Apply CSS to structure and style web pages using modern layout techniques
- ✅ Understand responsive design principles and mobile-first thinking
- ✅ Evaluate and improve web accessibility using WCAG 2.1 Level AA standards
- ✅ Recognize and prevent common accessibility barriers.

---

## **T02 - L1: Tools Setup & Semantic HTML Fundamentals**

### **Date:** September 20, 2026 (Friday)
### **Duration:** 2 hours
### **Key Sections Covered:**

#### **Part A: Developer Tools & Environment Setup**

1. **Choosing Your Text Editor**
   - Visual Studio Code (VS Code) — recommended for beginners
   - Features: Extensions, built-in terminal, Git integration
   - Alternative editors: Sublime Text, Atom, Vim

2. **Browser Developer Tools**
   - Opening the Inspector (Right-click → Inspect)
   - Viewing the HTML source
   - Checking computed CSS
   - Debugging common layout issues

3. **File Management**
   - Creating a project folder structure
   - Naming files and folders (lowercase, hyphens, no spaces)
   - Understanding file paths (relative vs. absolute)
   - Using GitHub for version control

4. **Local Development Server**
   - Why you need a local server (not just opening files directly)
   - Python's http.server or Live Server extension
   - Debugging with console and network tabs

#### **Part B: Semantic HTML Fundamentals**

1. **What HTML Is (and Isn't)**
   - HTML = HyperText Markup Language (markup, not programming)
   - Markup = labeling content, not calculating or making decisions
   - HTML structures content; CSS styles it; JavaScript makes it interactive

2. **HTML Elements Anatomy**
   - Opening tag: `<p>`
   - Content: "This is a paragraph"
   - Closing tag: `</p>`
   - Together: `<p>This is a paragraph.</p>`
   - Attributes: `<img src="cat.jpg" alt="A grey tabby cat">`
   - Self-closing elements: `<img>`, `<br>`, `<input>`

3. **Semantic vs. Non-Semantic HTML**
   - **Semantic**: `<button>`, `<nav>`, `<article>`, `<header>` — tag name describes purpose
   - **Non-semantic**: `<div>`, `<span>` — generic containers with no built-in meaning
   - Why semantic HTML matters:
     - Screen readers understand page structure
     - Search engines rank your content better
     - Easier for developers to maintain code
     - Browser provides built-in behavior (e.g., `<button>` is clickable by default)

4. **Page Structure with Landmark Elements**
   - `<header>` — introductory content (logo, title)
   - `<nav>` — navigation links
   - `<main>` — primary content (only one per page)
   - `<section>` — a thematic grouping of content
   - `<article>` — self-contained, reusable content (blog post, product review)
   - `<aside>` — supplementary content (sidebar, related links)
   - `<footer>` — closing content (copyright, links, contact)

5. **Heading Hierarchy**
   - `<h1>` — main page title (use exactly one per page)
   - `<h2>` — major sections
   - `<h3>` — subsections within h2
   - `<h4>`, `<h5>`, `<h6>` — deeper nesting
   - **Rule**: Never skip levels (e.g., don't jump from h1 to h3)
   - **Never use headings purely for visual size** — use CSS instead

6. **Accessible Links**
   - `<a href="url">Link text</a>`
   - Good link text: "Read the full article" ✅
   - Bad link text: "Click here" ❌ (doesn't say what you're clicking for)
   - Links should make sense out of context (for screen reader users scanning just links)
   - Avoid empty links or links with only an icon

7. **Accessible Images**
   - `<img src="photo.jpg" alt="Description of what's in the photo">`
   - Alt text should be descriptive, not redundant (don't say "image of" — that's implied)
   - For decorative images, use `alt=""` to hide from screen readers
   - Don't include file paths in alt text (`alt="/images/photo.jpg"` ❌)

8. **Accessible Tables**
   - Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` semantic elements
   - Header cells should use `<th>` (not `<td>` with bold text)
   - Tables are for tabular data, not page layout
   - Add `scope="col"` or `scope="row"` to table headers
   - Use `<caption>` to describe the table's purpose

9. **Accessible Forms**
   - Every input must have an associated `<label>`
   - Association methods:
     - `for` attribute on label matches `id` on input: `<label for="email">Email:</label> <input id="email">`
     - Or nest input inside label: `<label>Email: <input type="email"></label>`
   - Required fields: Mark clearly in label or instructions
   - Error messages: Link to the field they describe
   - Provide helpful instructions for complex fields

### **Learning Activities:**

- [ ] Download and configure VS Code
- [ ] Explore browser DevTools (Inspector tab)
- [ ] Create your first project folder structure
- [ ] Write a basic HTML page with landmarks
- [ ] Practice writing semantic elements correctly
- [ ] Create an accessible navigation menu
- [ ] Build a sample form with proper labels
- [ ] Code-along: Create an article page with heading hierarchy

### **Key Deliverables:**

- [ ] A properly structured HTML file with landmarks
- [ ] At least one page with a clear heading hierarchy
- [ ] A form with all inputs labeled
- [ ] An image with descriptive alt text
- [ ] A simple table with proper headers

### **Resources:**

- 🔗 **MDN: Semantic HTML**: https://developer.mozilla.org/en-US/docs/Glossary/Semantic_HTML
- 🔗 **W3C: ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- 🔗 **WebAIM: Alt Text**: https://webaim.org/articles/alttext/
- 🎥 **VS Code Setup for Beginners**: Official VS Code docs
- 📚 **Starter Files**: Check the T02-L1-Starter.md file in your course materials

### **Common Beginner Mistakes:**

- ❌ Using `<div>` for everything instead of semantic elements
- ❌ Skipping heading levels (h1 → h3, missing h2)
- ❌ Using headings for visual size instead of CSS
- ❌ Forgetting closing tags
- ❌ Using only `<div>` and `<span>` for page structure
- ❌ Writing empty alt text for important images
- ❌ Not associating labels with form inputs
- ❌ Using tables for layout

### **Key Takeaways:**

> **Semantic HTML** means using tags that describe what content *is*, not just how it looks. Landmarks (`header`, `nav`, `main`, `footer`) give page structure. Headings create an outline. **Accessibility** means your content works for everyone — sighted users *and* those using screen readers. Every image needs alt text, every form input needs a label, every link should make sense out of context.

---

## **T02 - L2: Styling with CSS - Layout & Design**

### **Date:** September 20, 2026 (Friday)
### **Duration:** 2 hours
### **Key Sections Covered:**

1. **What CSS Is and Why It Exists**
   - CSS (Cascading Style Sheets) = how things look
   - HTML = structure and content
   - CSS = styling, layout, spacing, colors, fonts
   - Separation of concerns: Keep content separate from presentation

2. **CSS Syntax Basics**
   - Selectors: `h1`, `.classname`, `#id`, `[attribute]`
   - Properties: `color`, `font-size`, `background`, `margin`, `padding`
   - Values: `blue`, `16px`, `100%`, `auto`
   - Complete rule: `h1 { color: blue; font-size: 24px; }`

3. **Applying CSS to HTML**
   - Inline: `<p style="color: red;">` (discouraged — hard to maintain)
   - Internal: `<style>` tag in `<head>` (good for learning, okay for small projects)
   - External: Separate `.css` file (best practice for real projects)
   - Link syntax: `<link rel="stylesheet" href="styles.css">`

4. **Selectors and Specificity**
   - Element selectors: `p`, `div`, `header`
   - Class selectors: `.button`, `.hero-section` (reusable, preferred)
   - ID selectors: `#main-nav` (unique, use sparingly)
   - Attribute selectors: `[type="email"]`
   - Combinators: descendant (` `), child (`>`), sibling (`+`, `~`)
   - Specificity: ID > Class > Element (be mindful of cascading)

5. **The Box Model**
   - Content → Padding (space inside) → Border → Margin (space outside)
   - `width` and `height` set content size
   - `padding` adds space inside the box
   - `border` draws a line around the box
   - `margin` adds space outside the box
   - `box-sizing: border-box;` makes sizing easier to predict

6. **Flexbox for Layout**
   - Container properties: `display: flex`, `justify-content`, `align-items`, `flex-direction`
   - Item properties: `flex-grow`, `flex-shrink`, `flex-basis`, `order`
   - Perfect for navbars, cards, and responsive layouts
   - More intuitive than float-based layouts

7. **CSS Grid for Layout**
   - Grid vs. Flexbox: Grid = 2D, Flexbox = 1D
   - Grid properties: `display: grid`, `grid-template-columns`, `grid-gap`
   - Grid items: `grid-column`, `grid-row`
   - Great for full-page layouts and complex designs

8. **Responsive Design with Media Queries**
   - Mobile-first approach: Write styles for mobile first, then add breakpoints for larger screens
   - Common breakpoints: 600px (tablet), 768px (desktop), 1200px (wide)
   - Syntax: `@media (min-width: 768px) { ... }`
   - Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`

9. **Typography**
   - Font families: serif, sans-serif, monospace
   - Font size and line height (accessibility: line-height ≥ 1.5)
   - Font weight: normal, bold, or numeric (400, 700, etc.)
   - Color contrast: Make sure text is readable
   - Web fonts: Google Fonts, etc.

10. **Colors and Contrast**
    - Color formats: named, hex (#FF0000), RGB, HSL
    - Accessibility: Sufficient contrast ratio (WCAG AA = 4.5:1 for body text)
    - Tools: WebAIM Color Contrast Checker
    - Never rely on color alone to convey information (some users are colorblind)

11. **Common CSS Properties**
    - Text: `font-size`, `font-weight`, `line-height`, `text-align`, `color`
    - Spacing: `margin`, `padding`, `gap`
    - Layout: `display`, `width`, `height`, `position`
    - Visual: `background`, `border`, `border-radius`, `box-shadow`
    - Transform: `transform`, `scale`, `rotate`, `translate`
    - Animation: `transition`, `animation`

12. **CSS Best Practices**
    - Use classes, not IDs, for styling
    - Avoid inline styles
    - Keep selectors specific but not overly specific (avoid `div.container > section.hero > h1`)
    - Use a CSS naming convention (BEM = Block Element Modifier)
    - Comment your CSS to explain complex sections
    - Use variables (CSS Custom Properties) for colors, sizes, fonts

### **Learning Activities:**

- [ ] Write CSS for semantic HTML from T02-L1
- [ ] Practice selectors and specificity with live examples
- [ ] Build a card component with flexbox
- [ ] Create a responsive navigation bar
- [ ] Use media queries for mobile/tablet/desktop layouts
- [ ] Practice color contrast checking with WebAIM
- [ ] Hands-on: Style a form for better accessibility
- [ ] Code-along: Build a responsive landing page layout

### **Key Deliverables:**

- [ ] Styled HTML page with external CSS file
- [ ] At least one responsive layout using flexbox or grid
- [ ] Mobile-first media queries for tablet and desktop
- [ ] Proper color contrast on all text
- [ ] A styled form with clear focus states
- [ ] At least two CSS components (e.g., button, card)

### **Resources:**

- 🔗 **MDN: CSS Documentation**: https://developer.mozilla.org/en-US/docs/Web/CSS
- 🔗 **CSS Tricks: Flexbox Guide**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- 🔗 **CSS Tricks: Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/
- 🎨 **Google Fonts**: https://fonts.google.com/
- 🎯 **WebAIM: Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- 📚 **Completed Files**: Check the T02-L2-Completed.md file in your course materials

### **Common Beginner Mistakes:**

- ❌ Using too many inline styles
- ❌ Not using classes for reusable styles
- ❌ Forgetting the viewport meta tag (makes mobile design fail)
- ❌ Using pixels for everything (should use em/rem for responsive sizing)
- ❌ Not testing on actual mobile devices or with responsive design mode
- ❌ Poor color contrast (text too light on light background)
- ❌ Overusing ID selectors (makes CSS hard to override)
- ❌ Not using external CSS files for larger projects

### **Key Takeaways:**

> **CSS** styles HTML — it controls layout, colors, fonts, and spacing. **Flexbox** and **Grid** are modern, powerful layout tools. **Mobile-first** responsive design ensures your site works on all device sizes. **Color contrast** is essential for accessibility. **External CSS files** keep your code organized and reusable.

---

## **T02 - L3: Web Accessibility (WCAG) & Inclusive Design**

### **Date:** September 20, 2026 (Friday)
### **Duration:** 2 hours
### **Key Sections Covered:**

1. **What Is Web Accessibility?**
   - Definition: Making websites usable by everyone, including people with disabilities
   - Disabilities can be: visual, auditory, motor, cognitive, or temporary
   - Accessibility = Good UX for everyone, not just people with disabilities
   - Legal: WCAG compliance often required for public websites
   - Ethical: Your product should serve all users

2. **WCAG 2.1 Standards Overview**
   - Levels: A (minimum), AA (standard), AAA (enhanced)
   - Most organizations aim for AA compliance
   - Four principles: **POUR**
     - **P**erceptible: Information must be perceivable (not invisible to all senses)
     - **O**perable: Interface must be operable via keyboard, not just mouse
     - **U**nderstandable: Content and interface must be understandable
     - **R**obust: Content must work with assistive technologies

3. **Perceivable: Making Content Perceivable**
   - **Text alternatives**: Images need alt text (not just "image.jpg")
   - **Captions and transcripts**: Videos need captions for deaf/hard of hearing users
   - **Sensory characteristics**: Don't rely on color alone; use text labels too
   - **Sufficient contrast**: Text/background contrast ≥ 4.5:1 (WCAG AA)
   - **Resizable text**: Users should be able to zoom without breaking layout

4. **Operable: Making Interfaces Usable Without a Mouse**
   - **Keyboard accessible**: Every interactive element must work via Tab and Enter keys
   - **Focus indicators**: Visible outline when tabbing (don't remove with `outline: none` without replacement)
   - **No keyboard traps**: Users shouldn't get stuck on an element
   - **Sufficient time**: Don't auto-advance slides or auto-close modals too quickly
   - **Seizure prevention**: Avoid flashing content (>3 per second)
   - **Skip links**: "Skip to main content" link at top of page

5. **Understandable: Making Content Clear and Predictable**
   - **Readable text**: Clear language, good contrast, ≥1.5 line spacing
   - **Predictable behavior**: Links go to where they say they go; forms submit when expected
   - **Consistent navigation**: Menus in same place on every page
   - **Predictable interactions**: Don't change content unexpectedly when user focuses/hovers
   - **Error prevention and recovery**: Forms should catch errors before submission; error messages should be clear

6. **Robust: Working with Assistive Technology**
   - **Semantic HTML**: Use correct tags so screen readers understand structure
   - **ARIA (Accessible Rich Internet Applications)**: Supplement HTML when needed
   - **Form labels**: Every input has a `<label>` so screen readers know what to read
   - **Headings and structure**: Proper heading hierarchy helps screen reader users navigate
   - **Focus management**: When opening a modal, move focus into it

7. **Common Accessibility Barriers and Fixes**

   | Barrier               | Who It Affects                  | Solution                                              |
   | --------------------- | ------------------------------- | ----------------------------------------------------- |
   | Missing alt text      | Blind/vision-impaired           | Add descriptive alt text to images                    |
   | Color only            | Colorblind users                | Add text labels or patterns, not just color           |
   | No captions           | Deaf/hard of hearing            | Add captions and transcripts to videos                |
   | Keyboard inaccessible | Motor disabilities              | Make all interactive elements accessible via keyboard |
   | Poor contrast         | Vision-impaired, bright screens | 4.5:1 contrast ratio minimum                          |
   | Small text            | Vision-impaired, older users    | Ensure text can be resized; use ≥16px base            |
   | Long line lengths     | Dyslexic users                  | Keep line width ≤70 characters                        |
   | Flashing content      | Seizure disorders               | Avoid flashing >3x per second                         |
   | Unstructured content  | Screen reader users             | Use semantic HTML and headings                        |
   | Form without labels   | Screen reader users             | Associate label with every input                      |

8. **Testing for Accessibility**
   - **Manual testing**: Tab through your site; does keyboard work?
   - **Screen reader testing**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
   - **Browser extensions**: axe DevTools, Lighthouse, WebAIM contrast checker
   - **Automated tools**: Run scans, but remember 80% of issues need human review
   - **User testing**: Test with people who actually use assistive tech

9. **Designing Inclusively from the Start**
   - Accessibility shouldn't be an afterthought or a checklist
   - Think about different abilities from day one
   - Design with users in mind, not "for accessibility"
   - Test early and often with real users

10. **Responsive Design is Accessibility**
    - Mobile users often have different needs
    - Touch targets need to be large enough (≥48px)
    - Responsive text scaling
    - Landscape orientation should work

11. **Tools and Resources**
    - **axe DevTools**: Automated accessibility auditing
    - **Lighthouse**: Built into Chrome; runs audit report
    - **WAVE**: Web accessibility evaluation tool (browser extension)
    - **NVDA**: Free screen reader (Windows)
    - **WebAIM**: Color contrast checker, resources
    - **WCAG 2.1 Checklist**: https://www.w3.org/WAI/test-evaluate/

12. **Real-World Example: Accessible Form**
    ```html
    <!-- Before (inaccessible) -->
    <div>Name:</div>
    <input type="text">
    
    <!-- After (accessible) -->
    <label for="name">Name:</label>
    <input id="name" type="text" required aria-describedby="name-hint">
    <small id="name-hint">Required. Use first and last name.</small>
    ```

### **Learning Activities:**

- [ ] Audit your site with Lighthouse
- [ ] Run an automated accessibility check with axe DevTools
- [ ] Test keyboard navigation on a real page
- [ ] Review your color contrast with WebAIM
- [ ] Listen to your page with a screen reader
- [ ] Test on actual mobile devices (or responsive design mode)
- [ ] Fix accessibility barriers you find
- [ ] Create an accessibility checklist for a project
- [ ] Group discussion: Accessibility wins and barriers you've encountered

### **Key Deliverables:**

- [ ] Site passes Lighthouse accessibility audit (90+)
- [ ] All images have appropriate alt text
- [ ] Full keyboard navigation works
- [ ] Color contrast is sufficient (4.5:1 for text)
- [ ] All form inputs have associated labels
- [ ] Proper heading hierarchy
- [ ] Focus indicators are visible
- [ ] WCAG AA checklist completed

### **Resources:**

- 🔗 **W3C WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- 🔗 **WebAIM**: https://webaim.org/
- 🔗 **Deque axe DevTools**: https://www.deque.com/axe/devtools/
- 🔗 **Google Lighthouse**: Chrome DevTools built-in
- 🎤 **NVDA Screen Reader**: https://www.nvaccess.org/
- 📚 **Completed Files**: Check the T02-L3-Completed.md file in your course materials
- 📚 **WCAG Checklist**: https://www.w3.org/WAI/test-evaluate/

### **Common Accessibility Myths (Busted!)**

- ❌ **Myth**: Accessibility is only for people with disabilities
  - ✅ **Reality**: Accessibility benefits everyone (captions help in loud places, large text helps in bright sun, keyboard shortcuts speed up power users)

- ❌ **Myth**: Accessibility is expensive
  - ✅ **Reality**: Building accessible sites from the start costs less than retrofitting

- ❌ **Myth**: Accessible sites are boring
  - ✅ **Reality**: Accessibility and beautiful design go together

- ❌ **Myth**: I'll add accessibility later
  - ✅ **Reality**: Accessibility needs to be built in from the start; it's much harder to bolt on later

### **Key Takeaways:**

> **Web accessibility** means your site works for *everyone* — regardless of disability. **WCAG AA** is the standard to aim for. The four principles are **POUR**: Perceivable, Operable, Understandable, Robust. **Semantic HTML**, **alt text**, **keyboard navigation**, and **color contrast** are the foundation. Use **tools** to test, but remember: automation catches ~20% of issues; user testing finds the rest. **Accessibility is good UX for everyone.**

---

## **Key Glossary - Topic 02**

| Term                     | Definition                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **HTML**                 | HyperText Markup Language — a markup language that structures and labels web content                                     |
| **Semantic HTML**        | HTML tags whose names describe what content is or means (e.g., `<nav>`, `<article>`)                                     |
| **Non-semantic**         | Generic containers like `<div>` and `<span>` that carry no built-in meaning                                              |
| **Landmark Elements**    | Semantic tags that define page regions: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`   |
| **CSS**                  | Cascading Style Sheets — controls how HTML elements look and are positioned                                              |
| **Flexbox**              | CSS layout module for 1D layouts (rows or columns) with flexible sizing                                                  |
| **Grid**                 | CSS layout module for 2D layouts (rows and columns)                                                                      |
| **Media Query**          | CSS rule that applies styles based on device characteristics (screen size, orientation)                                  |
| **Mobile-First**         | Design approach: write styles for mobile first, then add larger breakpoints                                              |
| **Box Model**            | CSS concept: Content → Padding → Border → Margin                                                                         |
| **Responsive Design**    | Design that adapts to different screen sizes and devices                                                                 |
| **Alt Text**             | Descriptive text for images that screen readers read aloud                                                               |
| **WCAG**                 | Web Content Accessibility Guidelines — standards for accessible web design                                               |
| **Accessibility (a11y)** | Making websites usable by everyone, including people with disabilities                                                   |
| **Screen Reader**        | Software that reads webpage content aloud for blind/vision-impaired users                                                |
| **Keyboard Navigation**  | Ability to use a website via Tab, Enter, and arrow keys (no mouse)                                                       |
| **Focus Indicator**      | Visual outline showing which element is currently focused (being interacted with)                                        |
| **Color Contrast**       | Difference in brightness between text and background (must be ≥4.5:1 for AA compliance)                                  |
| **ARIA**                 | Accessible Rich Internet Applications — HTML attributes that communicate roles, states, and properties to screen readers |
| **Label**                | HTML `<label>` element associated with form inputs to identify what each input is for                                    |
| **Caption**              | Text version of audio content (for videos)                                                                               |
| **Transcript**           | Full text version of audio or video content                                                                              |
| **DevTools**             | Browser developer tools for inspecting and debugging code                                                                |
| **Viewport**             | The visible area of a web page in a browser                                                                              |
| **DOM**                  | Document Object Model — the tree structure of HTML elements in a page                                                    |

---

## **Accessibility Self-Check Checklist**

Use this checklist as you build your projects:

### **Visual & Text**
- [ ] All images have descriptive alt text
- [ ] Text is readable (size ≥16px, contrast ≥4.5:1)
- [ ] Line height is ≥1.5
- [ ] Text can be resized without breaking layout
- [ ] Color isn't the only way to convey information

### **Structure**
- [ ] Page has exactly one `<h1>`
- [ ] Heading hierarchy doesn't skip levels (h1 → h2 → h3, not h1 → h3)
- [ ] Landmarks used correctly (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Lists use semantic elements (`<ul>`, `<ol>`, `<li>`)
- [ ] Tables have proper headers (`<th>` and `scope` attribute)

### **Keyboard & Navigation**
- [ ] All interactive elements (links, buttons, form inputs) are keyboard accessible
- [ ] Tab order makes sense (generally left-to-right, top-to-bottom)
- [ ] Focus indicators are visible (never remove outline without replacement)
- [ ] No keyboard traps (users can always Tab out)
- [ ] Skip links or landmark navigation to jump to main content

### **Forms**
- [ ] Every input has an associated `<label>` (not placeholder alone)
- [ ] Required fields are clearly marked
- [ ] Error messages are linked to fields and use plain language
- [ ] Form can be submitted via keyboard

### **Media**
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Animated content can be paused

### **Content**
- [ ] Language is clear and simple (no jargon without explanation)
- [ ] Information is logically organized
- [ ] Instructions are clear
- [ ] Links make sense out of context ("Read more" ❌ vs. "Read the full article about accessibility" ✅)

### **Tools**
- [ ] Ran Lighthouse audit (target: 90+)
- [ ] Checked color contrast with WebAIM
- [ ] Tested with keyboard navigation
- [ ] Tested with screen reader (if possible)
- [ ] Tested on mobile device or responsive mode

---

## **Before Next Module**

**Consolidation tasks:**

- [ ] Build a complete, accessible website (3–5 pages) combining all T02 skills
- [ ] Create a project following mobile-first, accessible design principles
- [ ] Run full accessibility audit and fix any issues
- [ ] Document your decisions in Markdown

---

## **Instructor Notes**

- **T02 L1 pace**: Semantic HTML confuses beginners who think "it's all the same, just `<div>` everything." Emphasize that *meaning* matters for screen readers and SEO
- **T02 L2 emphasis**: Many learners skip media queries — require them in all projects. Mobile-first is hard; show examples and practice it repeatedly
- **T02 L3 focus**: Make accessibility personal — mention a user with a disability you know, or have learners think about situations where they've benefited from accessibility features (captions in loud bars, large text on mobile, keyboard shortcuts)
- **Hands-on practice**: Have learners test their own sites with a screen reader (even a 5-minute demo changes perspective)
- **Real-world connection**: Show examples of inaccessible sites and how accessibility audits revealed barriers

---

## **Connecting T01 and T02**

- **T01**: Understanding *why* we build software (roles, SDLC, user stories)
- **T02**: Building *how* software looks and works (HTML, CSS, accessibility)

Both are essential: good intentions (T01) + good implementation (T02) = products that serve users well.

---

**Module 1 - Topic 02 Complete! 🎉**

You've now learned to structure semantic HTML, style it with CSS, and ensure it's accessible to everyone. You're ready to build the web responsibly.

**Next Steps:** Review the Starter and Completed files for each lesson, complete all hands-on activities, and start your project!