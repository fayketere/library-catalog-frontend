import { useState } from "react";

const spaces = [
  { id: "quiet-study-room", label: "Quiet study room" },
  { id: "group-study-room", label: "Group study room" },
  { id: "community-hall", label: "Community hall" },
];

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingForm() {
  const [booking, setBooking] = useState({ space: "", date: "", startTime: "", endTime: "" });
  const [feedback, setFeedback] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setBooking(current => ({ ...current, [name]: value }));
    setFeedback("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (booking.endTime <= booking.startTime) {
      setFeedback("Choose an end time later than the start time.");
      return;
    }
    setFeedback("Your booking details are ready. They have not been sent to the library yet.");
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-form__field">
        <label htmlFor="booking-space">Space</label>
        <select id="booking-space" name="space" value={booking.space} onChange={updateField} required>
          <option value="">Choose a space</option>
          {spaces.map(space => <option key={space.id} value={space.id}>{space.label}</option>)}
        </select>
      </div>
      <div className="booking-form__field">
        <label htmlFor="booking-date">Date</label>
        <input id="booking-date" name="date" type="date" min={localDateString(new Date())} value={booking.date} onChange={updateField} required />
      </div>
      <div className="booking-form__times">
        <div className="booking-form__field">
          <label htmlFor="booking-start">Start time</label>
          <input id="booking-start" name="startTime" type="time" value={booking.startTime} onChange={updateField} required />
        </div>
        <div className="booking-form__field">
          <label htmlFor="booking-end">End time</label>
          <input id="booking-end" name="endTime" type="time" min={booking.startTime || undefined} value={booking.endTime} onChange={updateField} required />
        </div>
      </div>
      <button className="button button--dark" type="submit">Review booking details <span aria-hidden="true">→</span></button>
      {feedback && <p className="booking-form__feedback" role="status">{feedback}</p>}
    </form>
  );
}
