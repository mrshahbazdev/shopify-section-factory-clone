#!/usr/bin/env python3
"""
Generate a Shopify Liquid section for every section in app/data/sections.json.
Each category gets one base template with 5 style variations (colour/alignment/radius).
Output is written back to app/data/sections.json with a `liquid` field.
"""
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).parent.parent
SECTIONS_FILE = ROOT / "app" / "data" / "sections.json"

PALETTES = [
    {"bg": "#ffffff", "fg": "#111827", "accent": "#2563eb", "radius": "8px", "align": "left", "shadow": "0 4px 20px rgba(0,0,0,0.06)", "sectionPadding": "80px 20px"},
    {"bg": "#111827", "fg": "#ffffff", "accent": "#38bdf8", "radius": "12px", "align": "center", "shadow": "0 8px 32px rgba(0,0,0,0.25)", "sectionPadding": "96px 20px"},
    {"bg": "#f9fafb", "fg": "#111827", "accent": "#10b981", "radius": "16px", "align": "right", "shadow": "0 4px 24px rgba(0,0,0,0.05)", "sectionPadding": "80px 20px"},
    {"bg": "#fff7ed", "fg": "#431407", "accent": "#f59e0b", "radius": "8px", "align": "center", "shadow": "0 6px 24px rgba(0,0,0,0.08)", "sectionPadding": "88px 20px"},
    {"bg": "#ecfeff", "fg": "#083344", "accent": "#06b6d4", "radius": "24px", "align": "left", "shadow": "0 6px 28px rgba(0,0,0,0.07)", "sectionPadding": "80px 20px"},
]


def style_for(handle: str) -> int:
    return int(hashlib.md5(handle.encode()).hexdigest(), 16) % 5


def escape_schema(s: str) -> str:
    return s.replace('"', '\\"').replace("\n", " ")


def img_html(field: str = "section.settings.image") -> str:
    return f"""{{% if {field} %}}
  <img src="{{% {field} | image_url: width: 900 %}}" alt="{{{{ section.settings.heading | escape }}}}" loading="lazy" width="900" height="675" style="border-radius: var(--radius); width: 100%;" />
{{% else %}}
  <div style="aspect-ratio: 4/3; background: linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.1)); border-radius: var(--radius); display: grid; place-items: center; color: var(--fg); opacity: 0.5; font-weight: 600;">Image</div>
{{% endif %}}"""


def wrap(title: str, handle: str, style: int, inner: str, settings: list, blocks: list = None):
    p = PALETTES[style]
    schema = {
        "name": title,
        "tag": "section",
        "class": f"section-store-{handle}",
        "settings": settings,
        "presets": [{"name": title}],
    }
    if blocks:
        schema["blocks"] = blocks
    schema_json = json.dumps(schema, indent=2, ensure_ascii=False)
    return f"""<section id="section-{{{{ section.id }}}}" class="section-store-{handle} section-style-{style}">
<style>
.section-store-{handle} {{
  --bg: {p['bg']};
  --fg: {p['fg']};
  --accent: {p['accent']};
  --radius: {p['radius']};
  --align: {p['align']};
  --shadow: {p['shadow']};
  --sectionPadding: {p['sectionPadding']};
  background: var(--bg);
  color: var(--fg);
}}
.section-store-{handle} .ss-wrap {{
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--sectionPadding);
  text-align: var(--align);
}}
.section-store-{handle} .ss-title {{
  font-size: clamp(2.2rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.05;
  margin: 0 0 18px;
  letter-spacing: -0.02em;
}}
.section-store-{handle} .ss-subtitle {{
  font-size: 1.15rem;
  line-height: 1.7;
  opacity: 0.85;
  max-width: 680px;
  margin: 0 auto 28px;
}}
.section-store-{handle} .ss-btn {{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 32px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}}
.section-store-{handle} .ss-btn:hover {{
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}}
.section-store-{handle} img {{ max-width: 100%; height: auto; border-radius: var(--radius); }}
.section-store-{handle} .placeholder-image {{
  border-radius: var(--radius);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
}}
</style>
<div class="ss-wrap">
{inner}
</div>
{{% schema %}}
{schema_json}
{{% endschema %}}
</section>
"""


COMMON_TEXT = [
    {"type": "text", "id": "heading", "label": "Heading", "default": "Section heading"},
    {"type": "richtext", "id": "subheading", "label": "Subheading", "default": "<p>Add your subheading here.</p>"},
]
COMMON_LINK = [
    {"type": "text", "id": "button_label", "label": "Button label", "default": "Learn more"},
    {"type": "url", "id": "button_link", "label": "Button link"},
]
COMMON_IMAGE = [
    {"type": "image_picker", "id": "image", "label": "Image"},
]


# ---------------- Generic / simple categories ----------------
def generic(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <a class="ss-btn" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label }}</a>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_LINK)


def text_section(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def hero(title, handle, style):
    p = PALETTES[style]
    inner = f"""  <div style="display: grid; gap: 32px; align-items: center; place-items: {p['align']};">
    <div>
      <h2 class="ss-title">{{{{ section.settings.heading }}}}</h2>
      <div class="ss-subtitle">{{{{ section.settings.subheading }}}}</div>
      <a class="ss-btn" href="{{{{ section.settings.button_link | default: '#' }}}}">{{{{ section.settings.button_label }}}}</a>
    </div>
    <div>
      {img_html('section.settings.image')}
    </div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_IMAGE + COMMON_LINK)


def image_with_text(title, handle, style):
    p = PALETTES[style]
    directions = ["row", "row-reverse", "column", "column", "row"]
    direction = directions[style]
    inner = f"""  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: center; flex-direction: {direction}; text-align: {p['align']};">
    <div style="flex: 1 1 320px; min-width: 280px;">
      {img_html('section.settings.image')}
    </div>
    <div style="flex: 1 1 320px; min-width: 280px;">
      <h2 class="ss-title">{{{{ section.settings.heading }}}}</h2>
      <div class="ss-subtitle">{{{{ section.settings.subheading }}}}</div>
      <a class="ss-btn" href="{{{{ section.settings.button_link | default: '#' }}}}">{{{{ section.settings.button_label }}}}</a>
    </div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_IMAGE + COMMON_LINK)


def features(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 32px; text-align: center;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        <div style="padding: 24px; background: rgba(0,0,0,0.03); border-radius: var(--radius);">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: var(--accent); border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700;">F</div>
          <h3 style="margin: 0 0 8px; font-size: 1.25rem;">{{ block.settings.heading }}</h3>
          <p style="margin: 0; opacity: 0.8;">{{ block.settings.text }}</p>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..4) %}
        <div style="padding: 24px; background: rgba(0,0,0,0.03); border-radius: var(--radius);">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: var(--accent); border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700;">F</div>
          <h3 style="margin: 0 0 8px; font-size: 1.25rem;">Feature {{ i }}</h3>
          <p style="margin: 0; opacity: 0.8;">Describe a key feature here.</p>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "feature", "name": "Feature", "settings": [
            {"type": "text", "id": "heading", "label": "Heading", "default": "Feature"},
            {"type": "text", "id": "text", "label": "Text", "default": "Describe this feature."},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def testimonial(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 32px;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        <div style="padding: 24px; background: rgba(0,0,0,0.03); border-radius: var(--radius); text-align: left;">
          <p style="font-style: italic; margin: 0 0 16px;">“{{ block.settings.quote }}”</p>
          <p style="font-weight: 700; margin: 0;">— {{ block.settings.author }}</p>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..3) %}
        <div style="padding: 24px; background: rgba(0,0,0,0.03); border-radius: var(--radius); text-align: left;">
          <p style="font-style: italic; margin: 0 0 16px;">“A customer review goes here. It builds trust and helps conversions.”</p>
          <p style="font-weight: 700; margin: 0;">— Happy Customer</p>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "testimonial", "name": "Testimonial", "settings": [
            {"type": "text", "id": "quote", "label": "Quote", "default": "Great product and service!"},
            {"type": "text", "id": "author", "label": "Author", "default": "Happy Customer"},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def faq(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="max-width: 800px; margin: 32px auto 0; text-align: left;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        <details style="margin-bottom: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius); padding: 16px;">
          <summary style="font-weight: 700; cursor: pointer;">{{ block.settings.question }}</summary>
          <div style="margin-top: 12px; opacity: 0.9;">{{ block.settings.answer }}</div>
        </details>
      {% endfor %}
    {% else %}
      {% for i in (1..4) %}
        <details style="margin-bottom: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius); padding: 16px;">
          <summary style="font-weight: 700; cursor: pointer;">Question {{ i }}</summary>
          <div style="margin-top: 12px; opacity: 0.9;">Answer text goes here.</div>
        </details>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "faq", "name": "FAQ", "settings": [
            {"type": "text", "id": "question", "label": "Question", "default": "Question"},
            {"type": "richtext", "id": "answer", "label": "Answer", "default": "<p>Answer text goes here.</p>"},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def collection(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-top: 32px;">
    {% if section.settings.collection != blank %}
      {% for product in section.settings.collection.products limit: section.settings.product_limit %}
        <div style="border-radius: var(--radius); overflow: hidden; background: rgba(0,0,0,0.03); text-align: left;">
          {% if product.featured_image %}
            <img src="{{ product.featured_image | image_url: width: 400 }}" alt="{{ product.title | escape }}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;" loading="lazy" width="400" height="400" />
          {% else %}
            <div style="aspect-ratio: 1/1; background: rgba(0,0,0,0.1); display: grid; place-items: center;">No image</div>
          {% endif %}
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 1rem;">{{ product.title }}</h3>
            <p style="margin: 0; font-weight: 700;">{{ product.price | money }}</p>
          </div>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..4) %}
        <div style="border-radius: var(--radius); overflow: hidden; background: rgba(0,0,0,0.03); text-align: left;">
          <div style="aspect-ratio: 1/1; background: rgba(0,0,0,0.1); display: grid; place-items: center;">Product</div>
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 1rem;">Product {{ i }}</h3>
            <p style="margin: 0; font-weight: 700;">$0.00</p>
          </div>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT + [
        {"type": "collection", "id": "collection", "label": "Collection"},
        {"type": "range", "id": "product_limit", "label": "Products to show", "min": 1, "max": 12, "step": 1, "default": 4},
    ]
    return wrap(title, handle, style, inner, settings)


def video(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="margin-top: 32px; border-radius: var(--radius); overflow: hidden;">
    {% if section.settings.video_url != blank %}
      <video src="{{ section.settings.video_url }}" style="width: 100%;" controls poster="{% if section.settings.image %}{{ section.settings.image | image_url: width: 1200 }}{% endif %}"></video>
    {% else %}
      {{ section.settings.image | image_url: width: 1200 | image_tag: loading: 'lazy' }}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT + [
        {"type": "url", "id": "video_url", "label": "Video URL"},
        {"type": "image_picker", "id": "image", "label": "Poster image"},
    ]
    return wrap(title, handle, style, inner, settings)


def slider(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: flex; gap: 16px; overflow-x: auto; margin-top: 32px; scroll-snap-type: x mandatory; padding-bottom: 12px;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        <div style="flex: 0 0 80%; scroll-snap-align: start; border-radius: var(--radius); overflow: hidden; background: rgba(0,0,0,0.03); min-height: 260px; display: grid; place-items: center; padding: 24px;">
          <h3 style="margin: 0;">{{ block.settings.slide_title }}</h3>
          <p style="margin-top: 8px;">{{ block.settings.slide_text }}</p>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..3) %}
        <div style="flex: 0 0 80%; scroll-snap-align: start; border-radius: var(--radius); overflow: hidden; background: rgba(0,0,0,0.03); min-height: 260px; display: grid; place-items: center; padding: 24px;">
          <h3 style="margin: 0;">Slide {{ i }}</h3>
          <p style="margin-top: 8px;">Add your slide content.</p>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "slide", "name": "Slide", "settings": [
            {"type": "text", "id": "slide_title", "label": "Title", "default": "Slide title"},
            {"type": "richtext", "id": "slide_text", "label": "Text", "default": "<p>Slide content.</p>"},
            {"type": "image_picker", "id": "image", "label": "Image"},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def tabs(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="max-width: 800px; margin: 32px auto 0; text-align: left;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        <div style="margin-bottom: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius); padding: 16px;">
          <h3 style="margin: 0 0 8px; color: var(--accent);">{{ block.settings.tab_title }}</h3>
          <div style="opacity: 0.9;">{{ block.settings.tab_content }}</div>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..3) %}
        <div style="margin-bottom: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius); padding: 16px;">
          <h3 style="margin: 0 0 8px; color: var(--accent);">Tab {{ i }}</h3>
          <div style="opacity: 0.9;">Tab content goes here.</div>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "tab", "name": "Tab", "settings": [
            {"type": "text", "id": "tab_title", "label": "Title", "default": "Tab title"},
            {"type": "richtext", "id": "tab_content", "label": "Content", "default": "<p>Tab content.</p>"},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def comparison(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <table style="width: 100%; max-width: 900px; margin: 32px auto 0; border-collapse: collapse; text-align: left;">
    <thead>
      <tr style="border-bottom: 2px solid var(--accent);">
        <th style="padding: 12px;">Feature</th>
        <th style="padding: 12px; text-align: center;">Basic</th>
        <th style="padding: 12px; text-align: center;">Pro</th>
      </tr>
    </thead>
    <tbody>
      {% for i in (1..4) %}
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
          <td style="padding: 12px;">Feature {{ i }}</td>
          <td style="padding: 12px; text-align: center;">—</td>
          <td style="padding: 12px; text-align: center; color: var(--accent); font-weight: 700;">✓</td>
        </tr>
      {% endfor %}
    </tbody>
  </table>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def header_section(title, handle, style):
    inner = """  <div style="padding: 12px 20px; background: var(--accent); color: #fff; text-align: center; font-weight: 600; font-size: 0.9375rem;">
    {{ section.settings.heading }}
    {% if section.settings.button_link != blank %}<a href="{{ section.settings.button_link }}" style="color: #fff; text-decoration: underline; margin-left: 8px;">{{ section.settings.button_label }}</a>{% endif %}
  </div>"""
    return wrap(title, handle, style, inner, [
        {"type": "text", "id": "heading", "label": "Announcement", "default": "Free shipping on orders over $50"},
    ] + COMMON_LINK)


def footer_section(title, handle, style):
    inner = """  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; text-align: left;">
    <div>
      <h3 style="margin: 0 0 12px; font-size: 1.125rem;">About</h3>
      <p style="margin: 0; opacity: 0.8;">{{ section.settings.subheading }}</p>
    </div>
    <div>
      <h3 style="margin: 0 0 12px; font-size: 1.125rem;">Newsletter</h3>
      <input type="email" placeholder="Email address" style="padding: 10px 14px; border-radius: var(--radius); border: 1px solid rgba(0,0,0,0.2); width: 100%; max-width: 240px;" />
    </div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def contact_form(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <form style="max-width: 600px; margin: 32px auto 0; display: grid; gap: 16px; text-align: left;" onsubmit="event.preventDefault();">
    <input type="text" name="name" placeholder="Name" style="padding: 12px 16px; border-radius: var(--radius); border: 1px solid rgba(0,0,0,0.2);" />
    <input type="email" name="email" placeholder="Email" style="padding: 12px 16px; border-radius: var(--radius); border: 1px solid rgba(0,0,0,0.2);" />
    <textarea name="message" rows="4" placeholder="Message" style="padding: 12px 16px; border-radius: var(--radius); border: 1px solid rgba(0,0,0,0.2);"></textarea>
    <button type="submit" class="ss-btn" style="border: none; cursor: pointer;">{{ section.settings.button_label }}</button>
  </form>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_LINK)


def countdown_timer(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div data-end="{{ section.settings.end_date }}" style="display: flex; gap: 16px; justify-content: center; margin-top: 24px; font-size: 2rem; font-weight: 700; color: var(--accent);">
    <div><span data-cd="d">00</span><small style="display:block; font-size:0.75rem; opacity:0.7;">DAYS</small></div>
    <div><span data-cd="h">00</span><small style="display:block; font-size:0.75rem; opacity:0.7;">HRS</small></div>
    <div><span data-cd="m">00</span><small style="display:block; font-size:0.75rem; opacity:0.7;">MIN</small></div>
    <div><span data-cd="s">00</span><small style="display:block; font-size:0.75rem; opacity:0.7;">SEC</small></div>
  </div>
  <script>
    (function(){
      var end = new Date(document.currentScript.previousElementSibling.getAttribute('data-end')).getTime();
      if (!end) return;
      setInterval(function(){
        var now = new Date().getTime(), d = end - now;
        if (d < 0) d = 0;
        var el = document.currentScript.previousElementSibling;
        el.querySelector('[data-cd=d]').innerText = Math.floor(d / (1000*60*60*24));
        el.querySelector('[data-cd=h]').innerText = Math.floor((d / (1000*60*60)) % 24);
        el.querySelector('[data-cd=m]').innerText = Math.floor((d / (1000*60)) % 60);
        el.querySelector('[data-cd=s]').innerText = Math.floor((d / 1000) % 60);
      }, 1000);
    })();
  </script>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + [
        {"type": "text", "id": "end_date", "label": "End date (ISO 8601)", "default": "2026-12-31T23:59:59"},
    ])


def blog(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 32px; text-align: left;">
    {% if section.settings.blog != blank %}
      {% for article in section.settings.blog.articles limit: section.settings.article_limit %}
        <div style="background: rgba(0,0,0,0.03); border-radius: var(--radius); padding: 24px;">
          <h3 style="margin: 0 0 8px; font-size: 1.125rem;">{{ article.title }}</h3>
          <p style="margin: 0 0 12px; opacity: 0.8;">{{ article.excerpt | strip_html | truncatewords: 20 }}</p>
          <a href="{{ article.url }}" style="color: var(--accent); font-weight: 600;">Read more</a>
        </div>
      {% endfor %}
    {% else %}
      {% for i in (1..3) %}
        <div style="background: rgba(0,0,0,0.03); border-radius: var(--radius); padding: 24px;">
          <h3 style="margin: 0 0 8px; font-size: 1.125rem;">Article {{ i }}</h3>
          <p style="margin: 0 0 12px; opacity: 0.8;">Blog excerpt goes here.</p>
          <a href="#" style="color: var(--accent); font-weight: 600;">Read more</a>
        </div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT + [
        {"type": "blog", "id": "blog", "label": "Blog"},
        {"type": "range", "id": "article_limit", "label": "Articles to show", "min": 1, "max": 9, "step": 1, "default": 3},
    ]
    return wrap(title, handle, style, inner, settings)


def scrolling(title, handle, style):
    inner = """  <div style="overflow: hidden; white-space: nowrap;">
    <div style="display: inline-block; animation: ss-marquee 20s linear infinite; padding-left: 100%;">
      <span style="display: inline-block; padding: 0 40px; font-size: 1.25rem; font-weight: 700;">{{ section.settings.heading }}</span>
      <span style="display: inline-block; padding: 0 40px; font-size: 1.25rem; font-weight: 700;">{{ section.settings.subheading | strip_html }}</span>
    </div>
  </div>
  <style>
    @keyframes ss-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
  </style>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def upsell(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-top: 32px;">
    <div style="border-radius: var(--radius); background: rgba(0,0,0,0.03); padding: 24px; min-width: 260px; text-align: left;">
      <h3 style="margin: 0 0 8px;">Upsell offer</h3>
      <p style="margin: 0 0 16px; opacity: 0.8;">Complete your order with this recommended item.</p>
      <a class="ss-btn" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label }}</a>
    </div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_LINK)


def before_after(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px;">
    <div style="border-radius: var(--radius); overflow: hidden;">
      <p style="margin: 0 0 8px; font-weight: 700;">Before</p>
      {{ section.settings.image | image_url: width: 600 | image_tag: loading: 'lazy', style: 'width:100%;' }}
    </div>
    <div style="border-radius: var(--radius); overflow: hidden;">
      <p style="margin: 0 0 8px; font-weight: 700;">After</p>
      {{ section.settings.image_2 | image_url: width: 600 | image_tag: loading: 'lazy', style: 'width:100%;' }}
    </div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + [
        {"type": "image_picker", "id": "image", "label": "Before image"},
        {"type": "image_picker", "id": "image_2", "label": "After image"},
    ])


def hotspots(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="position: relative; margin-top: 32px; border-radius: var(--radius); overflow: hidden;">
    {{ section.settings.image | image_url: width: 1200 | image_tag: loading: 'lazy', style: 'width:100%;' }}
    <div style="position: absolute; top: 25%; left: 30%; width: 24px; height: 24px; background: var(--accent); border-radius: 50%; color: #fff; display: grid; place-items: center; font-weight: 700; cursor: pointer;" title="Hotspot">1</div>
    <div style="position: absolute; top: 60%; left: 70%; width: 24px; height: 24px; background: var(--accent); border-radius: 50%; color: #fff; display: grid; place-items: center; font-weight: 700; cursor: pointer;" title="Hotspot">2</div>
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT + COMMON_IMAGE)


def shop_the_look(title, handle, style):
    return hotspots(title, handle, style)


def product_ingredients(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 32px; text-align: center;">
    {% for i in (1..6) %}
      <div style="padding: 16px; border-radius: var(--radius); background: rgba(0,0,0,0.03);">
        <div style="width: 40px; height: 40px; margin: 0 auto 12px; background: var(--accent); border-radius: 50%;"></div>
        <p style="margin: 0; font-weight: 600;">Ingredient {{ i }}</p>
      </div>
    {% endfor %}
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def steps(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-top: 32px; counter-reset: step;">
    {% for i in (1..4) %}
      <div style="padding: 24px; background: rgba(0,0,0,0.03); border-radius: var(--radius); position: relative; text-align: left;">
        <div style="width: 32px; height: 32px; background: var(--accent); color: #fff; border-radius: 50%; display: grid; place-items: center; font-weight: 700; margin-bottom: 12px;">{{ i }}</div>
        <h3 style="margin: 0 0 8px; font-size: 1.125rem;">Step {{ i }}</h3>
        <p style="margin: 0; opacity: 0.8;">Describe this step.</p>
      </div>
    {% endfor %}
  </div>"""
    return wrap(title, handle, style, inner, COMMON_TEXT)


def images(title, handle, style):
    inner = """  <h2 class="ss-title">{{ section.settings.heading }}</h2>
  <div class="ss-subtitle">{{ section.settings.subheading }}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 32px;">
    {% if section.blocks.size > 0 %}
      {% for block in section.blocks %}
        {{ block.settings.image | image_url: width: 600 | image_tag: loading: 'lazy', style: 'width:100%; border-radius: var(--radius);' }}
      {% endfor %}
    {% else %}
      {% for i in (1..6) %}
        <div style="aspect-ratio: 1/1; background: rgba(0,0,0,0.1); border-radius: var(--radius); display: grid; place-items: center;">Image {{ i }}</div>
      {% endfor %}
    {% endif %}
  </div>"""
    settings = COMMON_TEXT
    blocks = [
        {"type": "image", "name": "Image", "settings": [
            {"type": "image_picker", "id": "image", "label": "Image"},
        ]}
    ]
    return wrap(title, handle, style, inner, settings, blocks)


def snippets(title, handle, style):
    return text_section(title, handle, style)


CATEGORY_DISPATCH = {
    "hero": hero,
    "features": features,
    "testimonial": testimonial,
    "faq": faq,
    "collection": collection,
    "image-with-text": image_with_text,
    "video": video,
    "slider": slider,
    "tabs": tabs,
    "comparison": comparison,
    "header": header_section,
    "footer": footer_section,
    "contact-form": contact_form,
    "countdown-timer": countdown_timer,
    "blog": blog,
    "scrolling": scrolling,
    "text": text_section,
    "snippet": snippets,
    "upsell": upsell,
    "before-after": before_after,
    "hotspots": hotspots,
    "shop-the-look": shop_the_look,
    "product-ingredients": product_ingredients,
    "steps": steps,
    "images": images,
    "free": generic,
    "popular": generic,
    "page-templates": generic,
    "other": generic,
    "featured-collection": collection,
}


def generate_liquid(title: str, handle: str, groups: list) -> str:
    category = groups[0] if groups else "other"
    style = style_for(handle)
    fn = CATEGORY_DISPATCH.get(category, generic)
    return fn(title, handle, style)


def main():
    with open(SECTIONS_FILE, "r", encoding="utf-8") as f:
        sections = json.load(f)

    output_dir = ROOT / "app" / "sections"
    output_dir.mkdir(parents=True, exist_ok=True)

    for s in sections:
        liquid = generate_liquid(s["title"], s["handle"], s.get("groups", []))
        (output_dir / f"{s['handle']}.liquid").write_text(liquid, encoding="utf-8")

    # Remove embedded liquid from JSON; runtime loads from app/sections/*.liquid
    for s in sections:
        s.pop("liquid", None)

    with open(SECTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)

    print(f"Generated Liquid for {len(sections)} sections in {output_dir}.")


if __name__ == "__main__":
    main()
