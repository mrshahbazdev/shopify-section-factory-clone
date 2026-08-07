export function generateSectionLiquid(title: string, handle: string) {
  return `{% comment %}
  ${title} — section installed by Shopify Section Factory Clone
{% endcomment %}

<section id="section-${handle}" class="${handle}">
  <div class="page-width">
    <h2 class="section-title">{{ section.settings.heading | default: "${title.replace(/"/g, '\\"')}" }}</h2>
    <div class="section-content">
      {{ section.settings.subheading | default: "Add your custom content here." }}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "${title.replace(/"/g, '\\"')}",
  "tag": "section",
  "class": "section-${handle}",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "${title.replace(/"/g, '\\"')}"
    },
    {
      "type": "richtext",
      "id": "subheading",
      "label": "Subheading",
      "default": "<p>Add your custom content here.</p>"
    }
  ],
  "presets": [
    {
      "name": "${title.replace(/"/g, '\\"')}"
    }
  ]
}
{% endschema %}
`;
}
