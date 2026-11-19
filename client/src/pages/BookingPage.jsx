import BookingForm from "../components/BookingForm";

export default function BookingPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel booking-panel" aria-labelledby="booking-title">
        <p className="eyebrow">A place to focus</p>
        <h1 id="booking-title">Request a library space</h1>
        <p className="auth-panel__intro">Choose a space and time. This form is a preview; it does not submit a request yet.</p>
        <BookingForm />
      </section>
    </main>
  );
}
