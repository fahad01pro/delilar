// Default editable content for product info sections.
// Admin can override per product; new products auto-fill with these.
// Markdown-lite supported on render: lines starting with "- " become bullets,
// blank lines separate paragraphs, lines ending with ":" become subheadings.

export const DEFAULT_FABRIC = `Premium-grade, breathable fabric with a soft hand-feel
Reinforced double-stitching for long-lasting durability
Pre-shrunk and color-locked finish
Made in small, quality-controlled batches`;

export const DEFAULT_CARE = `- Gentle machine wash cold with similar colors
- Do not bleach; iron on low heat if needed
- Hang dry to preserve color, shape and finish
- Store folded in a cool, dry place away from sunlight`;

export const DEFAULT_SHIPPING = `- Flat delivery charge ৳150 across Bangladesh
- FREE shipping on every order above ৳5,000
- Estimated delivery: 3–5 business days nationwide
- Orders are processed within 24 hours (excluding Fridays)
- Cash on Delivery available across Bangladesh`;

export const DEFAULT_RETURNS = `Delilar does not operate a 7-day exchange policy. Please review carefully:

- If there is any size issue, damage, or product problem, the customer must check the product in front of the delivery person and return it immediately at that moment.
- After verification by Delilar, replacement or re-shipment may be approved.
- If the customer cancels the order after shipment or upon delivery for personal reasons, the delivery charge must still be paid.
- Attar, perfumes and personal-care items are non-returnable for hygiene reasons unless the seal is unbroken.
- Slight colour variation due to lighting and screen calibration is not considered a defect.`;

export const DEFAULT_FAQS = `Is the colour shown accurate?:
Colours are photographed in natural light and may vary slightly across screens. Minor variation is not a defect.

Do you offer Cash on Delivery?:
Yes — COD is available across all 64 districts of Bangladesh alongside secure online payment.

How do I track my order?:
Log into your Delilar account dashboard for real-time order tracking, or contact us on WhatsApp.

Can I exchange after the delivery person leaves?:
No. Please inspect the parcel in front of the rider. Concerns must be raised at that moment.

How do I choose the right size?:
Refer to the size guide on the product page or message us on WhatsApp for personal sizing help.`;

export type ProductInfoSections = {
  fabric: string;
  care: string;
  shipping: string;
  returns: string;
  faqs: string;
};

export const defaultInfoSections = (): ProductInfoSections => ({
  fabric: DEFAULT_FABRIC,
  care: DEFAULT_CARE,
  shipping: DEFAULT_SHIPPING,
  returns: DEFAULT_RETURNS,
  faqs: DEFAULT_FAQS,
});

export const mergeInfoSections = (raw: any): ProductInfoSections => {
  const d = defaultInfoSections();
  if (!raw || typeof raw !== 'object') return d;
  return {
    fabric: typeof raw.fabric === 'string' && raw.fabric.trim() ? raw.fabric : d.fabric,
    care: typeof raw.care === 'string' && raw.care.trim() ? raw.care : d.care,
    shipping: typeof raw.shipping === 'string' && raw.shipping.trim() ? raw.shipping : d.shipping,
    returns: typeof raw.returns === 'string' && raw.returns.trim() ? raw.returns : d.returns,
    faqs: typeof raw.faqs === 'string' && raw.faqs.trim() ? raw.faqs : d.faqs,
  };
};
