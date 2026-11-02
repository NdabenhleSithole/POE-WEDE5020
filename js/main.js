document.addEventListener("DOMContentLoaded", () => {
  // Update the footer year without repeating it across pages.
  document.querySelectorAll("footer .copyright-year").forEach(el => el.textContent = new Date().getFullYear());

  // Product category filtering and search work together.
  const products = [...document.querySelectorAll(".product-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const categoryLinks = [...document.querySelectorAll("[data-category-link]")];
  const search = document.querySelector("#product-search");
  const count = document.querySelector("#product-count");
  let activeCategory = "All";
  const normalise = value => value.toLocaleLowerCase().trim();

  function updateProducts(scroll = false) {
    const query = normalise(search?.value || "");
    let visible = 0;
    products.forEach(card => {
      const categoryMatch = activeCategory === "All" || card.dataset.category === activeCategory;
      const searchMatch = normalise(card.textContent).includes(query) || normalise(card.querySelector("img")?.alt || "").includes(query);
      const show = categoryMatch && searchMatch;
      card.hidden = !show;
      if (show) visible++;
    });
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === activeCategory;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    if (count) count.textContent = `Showing ${visible} of ${products.length} products`;
    if (scroll) document.querySelector("#products-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  filterButtons.forEach(button => button.addEventListener("click", () => { activeCategory = button.dataset.filter; updateProducts(true); }));
  categoryLinks.forEach(link => link.addEventListener("click", event => { event.preventDefault(); activeCategory = link.dataset.categoryLink; updateProducts(true); }));
  search?.addEventListener("input", () => updateProducts());
  if (products.length) updateProducts();

  // Product image lightbox. Escape and backdrop click close the preview.
  const lightbox = document.querySelector("#image-lightbox");
  if (lightbox) {
    const preview = lightbox.querySelector("img");
    const caption = lightbox.querySelector("p");
    const close = () => lightbox.close();
    products.forEach(card => {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Preview ${card.querySelector("h3")?.textContent || "product"} image`);
      const open = () => {
        const img = card.querySelector("img");
        if (!img) return;
        preview.src = img.src; preview.alt = img.alt;
        caption.textContent = card.querySelector("h3")?.textContent || img.alt;
        lightbox.showModal();
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    });
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", close);
    lightbox.addEventListener("click", event => { if (event.target === lightbox) close(); });
  }

  // Shared client-side validation: accessible inline errors, no fake server submission.
  function validate(form, feedback) {
    let firstInvalid = null;
    form.querySelectorAll("[required]").forEach(field => {
      field.removeAttribute("aria-invalid");
      const value = field.value.trim();
      let message = "";
      if (!value) message = "This field is required.";
      else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
      else if (field.minLength > 0 && value.length < field.minLength) message = `Please enter at least ${field.minLength} characters.`;
      else if (field.maxLength > 0 && value.length > field.maxLength) message = `Please use no more than ${field.maxLength} characters.`;
      if (message) { field.setAttribute("aria-invalid", "true"); firstInvalid ||= field; }
    });
    if (firstInvalid) {
      feedback.textContent = firstInvalid.validationMessage || "Please check the highlighted fields and try again.";
      // Custom length messages are clearer than browser defaults.
      if (firstInvalid.validity.valueMissing) feedback.textContent = "Please complete all required fields.";
      else if (firstInvalid.validity.typeMismatch) feedback.textContent = "Please enter a valid email address.";
      else if (firstInvalid.validity.tooShort) feedback.textContent = `Please enter at least ${firstInvalid.minLength} characters in the highlighted field.`;
      feedback.className = "form-feedback error"; firstInvalid.focus(); return false;
    }
    return true;
  }

  const enquiry = document.querySelector("#enquiry-form");
  enquiry?.addEventListener("submit", event => {
    event.preventDefault();
    const feedback = document.querySelector("#enquiry-feedback");
    if (!validate(enquiry, feedback)) return;
    const category = enquiry.elements.category.value;
    const names = { women: "Women", men: "Men", kids: "Kids", beauty: "Beauty", accessories: "Accessories", home: "Home & Living" };
    const priceNote = "Displayed prices are illustrative only. Availability and final prices must be confirmed on the official SHEIN South Africa website.";
    feedback.textContent = `Thank you, ${enquiry.elements.name.value.trim()}. Your ${names[category] || category} enquiry has been checked. ${priceNote}`;
    feedback.className = "form-feedback success";
  });

  const contact = document.querySelector("#contact-form");
  contact?.addEventListener("submit", event => {
    event.preventDefault();
    const feedback = document.querySelector("#contact-feedback");
    if (!validate(contact, feedback)) return;
    // Replace this placeholder with the intended recipient email before submission.
    const CONTACT_EMAIL = "replace-with-your-email@example.com";
    const subject = `[Website project] ${contact.elements.type.value}`;
    const body = `Name: ${contact.elements.name.value.trim()}\nEmail: ${contact.elements.email.value.trim()}\nMessage type: ${contact.elements.type.value}\n\nMessage:\n${contact.elements.message.value.trim()}`;
    feedback.textContent = "Your email draft is being prepared. Review it in your email app and press Send. Replace the placeholder recipient in js/main.js before using this form.";
    feedback.className = "form-feedback success";
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
