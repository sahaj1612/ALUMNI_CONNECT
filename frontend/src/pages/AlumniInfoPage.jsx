import { PublicHeader } from "../components/PublicHeader.jsx";

const committeeMembers = [
  ["1", "Prof. V. K. Parvati", "President", "SDMCET Dharwad\nvasukp@rediffmail.com\n9845253751"],
  ["2", "Dr. Ramesh L. Chakrasali", "Principal", "SDMCET Dharwad\npratisatu@gmail.com\n9845477797"],
  ["3", "Dr. J. D. Pujari", "Vice President (Internal)", "SDMCET Dharwad\njaggudp@gmail.com\n9480750607"],
  ["4", "Dr. S. G. Joshi", "Immediate Past President", "Vidyagiri, Dharwad\nsgjoshi99@yahoo.com\n8951426091"],
  ["5", "Er. Sunil Rai", "Vice President (External)", "Narayanpur, Dharwad\nraisunil@gmail.com\n9845250015"],
  ["6", "Dr. Sunilkumar Honnungar", "Secretary (Internal)", "SDMCET Dharwad\nsunilhonnugar@gmail.com\n9449041534"],
  ["7", "Er. Pramod Zalkikar", "Treasurer (External)", "Bharati Nagar, Dharwad\n9448372469"],
  ["8", "Er. Sanjeev Hiremath", "Secretary (External)", "Saptapur, Dharwad\nsanjeevhiremath@gmail.com\n9448114112"],
  ["9", "Prof. Indira Umarji", "EC Member", "SDMCET Dharwad\nindira.umarji@gmail.com\n9945348887"],
  ["10", "Prof. Rashmi S. H.", "EC Member", "SDMCET Dharwad\nrashmi78ster@gmail.com\n9164002200"],
  ["11", "Dr. S. S. Navalagund", "EC Member", "SDMCET Dharwad\nsiddunavalgund@gmail.com\n9880863708"],
  ["12", "Dr. Shravan Nayak", "EC Member", "SDMCET Dharwad\nshravannayak@rediffmail.com\n9448200483"],
  ["13", "Prof. Kushal Kapli", "EC Member", "SDMCET Dharwad\nkushalkapli9@gmail.com\n8892634095"],
  ["14", "Dr. Sachin Karadgi", "EC Member (External)", "Dharwad\nkaradgi@yahoo.com\n7899911836"],
  ["15", "Er. Vishnu Kusnur", "EC Member (External)", "Sadhanakeri, Dharwad\nvkusnur@gmail.com\n9845254303"],
  ["16", "Er. Neminath Desai", "EC Member (External)", "Saptapur, Dharwad\nnvdesai04@gmail.com\n9845711401"],
];

export function AlumniInfoPage() {
  return (
    <div className="public-page">
      <PublicHeader />

      <section className="page-header">
        <h1>Alumni Association</h1>
        <p>Executive Committee Members 2025-26</p>
      </section>

      <main className="public-container">
        <h2 className="section-title">Committee Members</h2>
        <div className="public-table-wrap">
          <table className="public-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {committeeMembers.map(([serial, name, designation, details]) => (
                <tr key={serial}>
                  <td>{serial}</td>
                  <td>{name}</td>
                  <td>{designation}</td>
                  <td className="pre-line">{details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
