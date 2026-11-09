
import { useState } from "react";
import {
  MapPin,
  Mail,
  Globe,
  Send,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import "./ContactPage.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function ContactPage() {
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setSubmitted(false);

      await api.post("/contact", formData);

      setFormData(initialForm);
      setSubmitted(true);
      toast.success("Your message has been sent successfully.");
    } catch (error) {
      console.error("Contact form submission error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="public-contact-page">
      <section className="contact-hero">
        <div className="contact-hero-pattern" />

        <div className="contact-hero-content">
          <span className="contact-eyebrow">
            WE ARE HERE TO LISTEN
          </span>

          <h1>
            Get In <span>Touch</span>
          </h1>

          <p>
            Have a question, suggestion, partnership opportunity or
            need assistance? Reach out to the Association of County
            Students Associations Presidents-Kenya.
          </p>
        </div>
      </section>

      <section className="public-contact-content">
        <div className="contact-section-heading">
          <span className="contact-section-eyebrow">
            CONNECT WITH ACSP-KENYA
          </span>

          <h2>We Would Love to Hear From You</h2>

          <p>
            Our team welcomes your enquiries, feedback and ideas.
            Send us a message and we will get back to you.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-information">
            <div className="contact-info-heading">
              <h3>Contact Information</h3>
              <p>
                Reach us through our official communication channels.
              </p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <Mail size={21} />
              </div>

              <div>
                <span>Email Address</span>
                <a href="mailto:info@acsapkenya.org">
                  info@acsapkenya.org
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <MapPin size={21} />
              </div>

              <div>
                <span>Our Location</span>
                <strong>Kenya</strong>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <Globe size={21} />
              </div>

              <div>
                <span>Official Website</span>
                <a
                  href="https://www.acsapkenya.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  www.acsapkenya.org
                </a>
              </div>
            </div>

            <div className="contact-info-note">
              <MessageSquare size={22} />
              <div>
                <strong>Let's start a conversation</strong>
                <p>
                  Your voice matters. We value every enquiry and
                  contribution towards strengthening student leadership
                  and county representation.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <div className="contact-form-heading">
              <h3>Send Us a Message</h3>
              <p>
                Complete the form below and our team will receive
                your message.
              </p>
            </div>

            {submitted && (
              <div className="contact-success-message">
                <CheckCircle2 size={19} />
                <span>
                  Thank you! Your message has been received successfully.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="contact-phone">
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    maxLength={30}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-subject">Subject *</label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is your enquiry about?"
                    maxLength={200}
                    required
                  />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-message">Your Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={7}
                  required
                />
              </div>

              <button
                type="submit"
                className="contact-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={17} className="contact-spinner" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
