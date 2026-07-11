"use client";

const APPOINTMENTS = [
  { date: "May 24, 2025", time: "10:00 AM", type: "Exilis + EMS", status: "Confirmed" },
  { date: "May 29, 2025", time: "2:00 PM", type: "Endospheres", status: "Confirmed" },
  { date: "Jun 3, 2025", time: "4:00 PM", type: "Lymphatic Drainage", status: "Pending" },
];

export default function AppointmentsPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Manage Your Schedule</p>
        <h1>appointments.</h1>
        <p className="portal-page-sub">View, reschedule and prepare for your upcoming sessions.</p>
      </div>

      <div className="simple-card">
        <h3>Upcoming Appointments</h3>
        <table className="simple-table">
          <tbody>
            {APPOINTMENTS.map((a) => (
              <tr key={a.date}>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.type}</td>
                <td><span className="simple-pill">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="dt-btn dt-btn-primary" style={{ marginTop: "20px" }}>
          book new appointment
        </button>
      </div>
    </div>
  );
}
