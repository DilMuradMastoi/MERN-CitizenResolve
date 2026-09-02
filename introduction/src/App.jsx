import React, { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Bell, ChevronRight, ClipboardList, FilePlus2, Home, LayoutDashboard,
  LogIn, LogOut, Menu, Plus, Search, ShieldCheck, Sparkles, UserRound, X
} from "lucide-react";
import { AuthProvider, useAuth } from "./auth";
import { complaints } from "./api";

const priorityClass = (p) => `priority priority-${String(p || "Low").toLowerCase()}`;
const statusClass = (s) => `status status-${String(s || "Pending").toLowerCase().replaceAll(" ", "-")}`;

function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}

function AppShell() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/complaints/new" element={<NewComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/officer" element={<OfficerDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Protected() {
  const { user } = useAuth();
  return user ? <LayoutOutlet /> : <Navigate to="/login" replace />;
}

function LayoutOutlet() {
  return <OutletShim />;
}
function OutletShim() {
  // Kept as a tiny wrapper so the protected tree remains readable.
  const location = useLocation();
  return <Routes>
    <Route element={<Layout />}>
      <Route path={location.pathname} element={<PageAtCurrentPath />} />
    </Route>
  </Routes>;
}
function PageAtCurrentPath() {
  const p = window.location.pathname;
  if (p === "/") return <HomePage />;
  if (p === "/complaints") return <ComplaintsPage />;
  if (p === "/complaints/new") return <NewComplaint />;
  if (p === "/my-complaints") return <MyComplaints />;
  if (p === "/officer") return <OfficerDashboard />;
  if (p.startsWith("/complaints/")) return <ComplaintDetails />;
  return <HomePage />;
}

function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/complaints", label: "Browse Complaints", icon: ClipboardList },
    { to: "/complaints/new", label: "Submit Complaint", icon: FilePlus2 }
  ];
  if (user?.role === "citizen") nav.push({ to: "/my-complaints", label: "My Complaints", icon: UserRound });
  if (user?.role === "officer") nav.push({ to: "/officer", label: "Officer Console", icon: ShieldCheck });

  return <div className="app">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={20}/></div><span>CitizenResolve</span></div>
      <nav>{nav.map(({to,label,icon:Icon}) => <NavItem key={to} to={to} label={label} icon={Icon} onClick={()=>setOpen(false)} />)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-user"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div><b>{user?.name}</b><small>{user?.role}</small></div></div>
        <button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button>
      </div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
        <div className="crumb"><Home size={15}/><span>Portal</span><ChevronRight size={14}/><b>{locationLabel()}</b></div>
        <div className="top-actions"><div className="welcome">Hi, {user?.name?.split(" ")[0]}</div><div className="notification"><Bell size={18}/></div></div>
      </header>
      <div className="content">{usePageOutlet()}</div>
    </main>
  </div>;
}

function usePageOutlet() {
  const p = window.location.pathname;
  if (p === "/") return <HomePage />;
  if (p === "/complaints") return <ComplaintsPage />;
  if (p === "/complaints/new") return <NewComplaint />;
  if (p === "/my-complaints") return <MyComplaints />;
  if (p === "/officer") return <OfficerDashboard />;
  if (p.startsWith("/complaints/")) return <ComplaintDetails />;
  return <HomePage />;
}

function locationLabel() {
  const p = window.location.pathname;
  if (p === "/") return "Overview";
  if (p === "/complaints") return "Complaints";
  if (p === "/complaints/new") return "Submit Complaint";
  if (p === "/my-complaints") return "My Complaints";
  if (p === "/officer") return "Officer Console";
  return "Complaint Details";
}

function NavItem({to,label,icon:Icon,onClick}) {
  const active = window.location.pathname === to;
  return <Link className={`nav-item ${active ? "active":""}`} to={to} onClick={onClick}><Icon size={18}/><span>{label}</span></Link>;
}

function AuthCard({ mode }) {
  const isLogin = mode === "login";
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"citizen" });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (isLogin) {
        const {data}=await (await import("./api")).auth.login({email:form.email,password:form.password});
        login(data); nav("/");
      } else {
        const {data}=await (await import("./api")).auth.signup(form);
        if (data?.user) {
          const logged = await (await import("./api")).auth.login({email:form.email,password:form.password});
          login(logged.data); nav("/");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Check the backend and try again.");
    } finally { setLoading(false); }
  }

  return <div className="auth-page">
    <div className="auth-visual">
      <div className="auth-copy"><div className="brand light"><div className="brand-mark"><ShieldCheck size={20}/></div><span>CitizenResolve</span></div>
      <div className="hero-orb"><Sparkles size={42}/></div>
      <h1>Make your community<br/><span>better, one report at a time.</span></h1>
      <p>A simple, transparent place to report civic issues and follow their progress.</p></div>
    </div>
    <div className="auth-panel">
      <div className="auth-form">
        <div className="eyebrow">{isLogin ? "WELCOME BACK" : "GET STARTED"}</div>
        <h2>{isLogin ? "Sign in to your portal" : "Create your account"}</h2>
        <p className="muted">{isLogin ? "Access your complaints and community updates." : "Report issues and keep track of resolutions."}</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          {!isLogin && <Field label="Full name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></Field>}
          <Field label="Email"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></Field>
          <Field label="Password"><input required type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></Field>
          {!isLogin && <Field label="Account type"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="citizen">Citizen</option><option value="officer">Officer</option></select><small className="hint">Use Officer only for authorized officer accounts.</small></Field>}
          <button className="btn primary full" disabled={loading}>{loading ? "Please wait…" : isLogin ? <><LogIn size={17}/> Sign in</> : <><Plus size={17}/> Create account</>}</button>
        </form>
        <div className="auth-switch">{isLogin ? <>New here? <Link to="/signup">Create an account</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}</div>
      </div>
    </div>
  </div>;
}

function Login(){ return <AuthCard mode="login"/>; }
function Signup(){ return <AuthCard mode="signup"/>; }

function HomePage() {
  const { user } = useAuth();
  return <div>
    <section className="hero">
      <div><div className="eyebrow">CITIZEN SERVICE PORTAL</div><h1>Turn local problems into <span>visible progress.</span></h1><p>Report, track, and resolve community issues with a transparent complaint workflow.</p>
      <div className="hero-actions"><Link className="btn primary" to="/complaints/new"><Plus size={18}/> Submit a complaint</Link><Link className="btn secondary" to="/complaints"><ClipboardList size={18}/> Explore complaints</Link></div></div>
      <div className="hero-card"><div className="hero-card-top"><span>LIVE WORKFLOW</span><Sparkles size={17}/></div><div className="progress-line"><i></i><i></i><i></i></div><div className="workflow"><div><b>Reported</b><small>Community</small></div><div><b>In review</b><small>Officer</small></div><div><b>Resolved</b><small>Verified</small></div></div></div>
    </section>
    <section className="feature-grid">
      <Feature icon={FilePlus2} title="Report clearly" text="Capture the issue, location, category, and supporting image." />
      <Feature icon={ClipboardList} title="Follow progress" text="See current status, officer remarks, and priority at a glance." />
      <Feature icon={ShieldCheck} title="Close the loop" text="After resolution, share a rating and feedback with your officer." />
    </section>
    {user?.role === "officer" && <section className="callout"><div><span className="eyebrow">OFFICER TOOLS</span><h2>Ready to review the queue?</h2><p>Open the officer console for live statistics, AI briefing, status updates, and CSV export.</p></div><Link className="btn primary" to="/officer">Open console <ChevronRight size={17}/></Link></section>}
  </div>;
}
function Feature({icon:Icon,title,text}) { return <div className="feature"><div className="feature-icon"><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></div>; }

function ComplaintsPage() {
  const [items,setItems]=useState([]), [loading,setLoading]=useState(true), [filters,setFilters]=useState({search:"",category:"",status:"",area:"",priority:""});
  async function load(){setLoading(true);try{const {data}=await complaints.list(filters);setItems(data.complaints||[])}catch{}finally{setLoading(false)}}
  React.useEffect(()=>{load()},[]);
  return <div><PageTitle eyebrow="COMMUNITY FEED" title="All complaints" text="Browse reported issues and see what needs attention.">
    <Link className="btn primary" to="/complaints/new"><Plus size={17}/> New complaint</Link></PageTitle>
    <div className="filters card">
      <div className="search-box"><Search size={17}/><input value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search title or description"/></div>
      <select value={filters.category} onChange={e=>{setFilters({...filters,category:e.target.value});}}><option value="">All categories</option>{["Road","Garbage","Water","Electricity","Other"].map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All statuses</option>{["Pending","In Progress","Resolved"].map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}><option value="">All priorities</option>{["Low","Medium","High","Critical"].map(x=><option key={x}>{x}</option>)}</select>
      <button className="btn secondary" onClick={load}>Apply</button>
    </div>
    {loading ? <Loading/> : items.length ? <div className="complaint-grid">{items.map(c=><ComplaintCard key={c._id} c={c}/>)}</div> : <Empty title="No complaints found" text="Try changing your filters or submit a new report."/>}
  </div>;
}

function ComplaintCard({c}) {
  return <Link to={`/complaints/${c._id}`} className="complaint-card">
    <div className="card-image">{c.imageUrl ? <img src={c.imageUrl} alt="" /> : <div className="image-placeholder"><ClipboardList size={28}/></div>}</div>
    <div className="complaint-body"><div className="tag-row"><span className="tag">{c.category}</span><span className={statusClass(c.status)}>{c.status}</span></div>
    <h3>{c.title}</h3><p>{truncate(c.description,105)}</p><div className="complaint-meta"><span>📍 {c.area}</span><span>▲ {c.upvotes || 0}</span><span className={priorityClass(c.priority)}>{c.priority}</span></div></div>
  </Link>;
}

function NewComplaint() {
  const nav=useNavigate(); const [form,setForm]=useState({title:"",description:"",category:"Road",area:"",imageUrl:""}); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();setLoading(true);setError("");try{const {data}=await complaints.create(form);nav(`/complaints/${data.complaint._id}`)}catch(err){setError(err.response?.data?.message||"Could not submit complaint.")}finally{setLoading(false)}}
  return <div><PageTitle eyebrow="NEW REPORT" title="Submit a complaint" text="Give enough detail for an officer and your community to understand the issue."/>
    <div className="form-layout"><form className="card form-card" onSubmit={submit}>
      {error&&<div className="alert error">{error}</div>}
      <Field label="Complaint title"><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Streetlight not working"/></Field>
      <Field label="Description"><textarea required rows="7" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe what is happening, how long it has been happening, and anything useful for the officer."/></Field>
      <div className="two-col"><Field label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["Road","Garbage","Water","Electricity","Other"].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Area / location"><input required value={form.area} onChange={e=>setForm({...form,area:e.target.value})} placeholder="Neighborhood or area"/></Field></div>
      <Field label="Image URL (optional)"><input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://…"/></Field>
      <div className="form-actions"><Link className="btn secondary" to="/complaints">Cancel</Link><button className="btn primary" disabled={loading}>{loading?"Submitting…":<><FilePlus2 size={17}/> Submit complaint</>}</button></div>
    </form><div className="side-note"><div className="feature-icon"><Sparkles size={19}/></div><h3>What makes a useful report?</h3><ul><li>Use a specific, easy-to-understand title.</li><li>Include landmarks or a recognizable area.</li><li>Explain what is affected and what you observed.</li><li>Add an image link when it helps document the issue.</li></ul></div></div>
  </div>;
}

function ComplaintDetails() {
  const {user}=useAuth(); const {id}=useParamsShim(); const [c,setC]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [rating,setRating]=useState(5),[comment,setComment]=useState("");
  async function load(){try{const {data}=await complaints.get(id);setC(data.complaint)}catch(e){setError(e.response?.data?.message||"Complaint not found.")}finally{setLoading(false)}}
  React.useEffect(()=>{load()},[id]);
  if(loading)return <Loading/>; if(error)return <Empty title="Unable to load" text={error}/>; if(!c)return null;
  const mine=user?.role==="citizen" && c.createdBy?._id===user.id;
  return <div><Link className="back" to="/complaints">← Back to complaints</Link><div className="detail-layout">
    <article className="detail-main">
      <div className="detail-image">{c.imageUrl?<img src={c.imageUrl} alt="Complaint evidence"/>:<div className="image-placeholder large"><ClipboardList size={46}/></div>}</div>
      <div className="detail-content"><div className="tag-row"><span className="tag">{c.category}</span><span className={statusClass(c.status)}>{c.status}</span><span className={priorityClass(c.priority)}>{c.priority} priority</span></div>
      <h1>{c.title}</h1><p className="lead">{c.description}</p><div className="meta-list"><span>📍 {c.area}</span><span>▲ {c.upvotes||0} upvotes</span><span>Filed {formatDate(c.createdAt)}</span></div>
      {c.officerRemark&&<div className="remark"><b>Officer remark</b><p>{c.officerRemark}</p></div>}
      {c.status!=="Resolved" && <button className="btn secondary" onClick={async()=>{await complaints.upvote(id);load()}}>▲ Upvote this complaint</button>}
      {c.status==="Resolved" && mine && !c.feedbackGiven && <Feedback rating={rating} setRating={setRating} comment={comment} setComment={setComment} onSubmit={async()=>{await complaints.feedback(id,{rating,comment});load()}}/>}
      {c.feedbackGiven&&<div className="feedback-view"><b>Your feedback</b><div className="stars">{"★".repeat(c.feedbackRating||0)}{"☆".repeat(5-(c.feedbackRating||0))}</div><p>{c.feedbackComment||"No comment provided."}</p></div>}
      </div>
    </article>
    <aside className="detail-side card"><h3>Complaint timeline</h3><Timeline status={c.status}/><div className="priority-box"><span>Priority score</span><strong>{c.priorityScore ?? "—"}</strong><small>Calculated from upvotes + age</small></div></aside>
  </div></div>;
}

function Feedback({rating,setRating,comment,setComment,onSubmit}){return <div className="feedback-form"><h3>How was the resolution?</h3><div className="star-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?"selected":""} onClick={()=>setRating(n)}>★</button>)}</div><textarea rows="3" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Optional feedback"/><button className="btn primary" onClick={onSubmit}>Submit feedback</button></div>}

function Timeline({status}){const steps=["Pending","In Progress","Resolved"];const idx=steps.indexOf(status);return <div className="timeline">{steps.map((s,i)=><div className={`timeline-item ${i<=idx?"done":""}`} key={s}><span>{i<idx?"✓":i===idx?"•":""}</span><div><b>{s}</b><small>{i===0?"Complaint received":i===1?"Officer is working on it":"Resolution completed"}</small></div></div>)}</div>}

function MyComplaints(){const [items,setItems]=useState([]),[loading,setLoading]=useState(true);React.useEffect(()=>{complaints.mine().then(r=>setItems(r.data.complaints||[])).catch(()=>{}).finally(()=>setLoading(false))},[]);return <div><PageTitle eyebrow="YOUR REPORTS" title="My complaints" text="Track everything you have submitted." ><Link className="btn primary" to="/complaints/new"><Plus size={17}/> New complaint</Link></PageTitle>{loading?<Loading/>:items.length?<div className="table-card card"><div className="table-wrap"><table><thead><tr><th>Complaint</th><th>Status</th><th>Priority</th><th>Upvotes</th><th>Filed</th></tr></thead><tbody>{items.map(c=><tr key={c._id}><td><Link className="table-title" to={`/complaints/${c._id}`}>{c.title}</Link><small>{c.area}</small></td><td><span className={statusClass(c.status)}>{c.status}</span></td><td><span className={priorityClass(c.priority)}>{c.priority}</span></td><td>{c.upvotes||0}</td><td>{formatDate(c.createdAt)}</td></tr>)}</tbody></table></div></div>:<Empty title="No complaints yet" text="Your submitted complaints will appear here."/>}</div>}

function OfficerDashboard(){
  const [summary,setSummary]=useState(null),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[filter,setFilter]=useState(""),[notice,setNotice]=useState("");
  async function load(){setLoading(true);try{const [a,b]=await Promise.all([complaints.list(filter?{status:filter}:{}), (await import("./api")).ai.officerSummary()]);setItems(a.data.complaints||[]);setSummary(b.data)}catch(e){setNotice(e.response?.data?.message||"Officer data could not be loaded.")}finally{setLoading(false)}}
  React.useEffect(()=>{load()},[filter]);
  async function update(id,status,remark){try{await complaints.status(id,{status,officerRemark:remark});setNotice("Complaint updated.");load()}catch(e){setNotice(e.response?.data?.message||"Update failed.")}}
  async function exportCsv(){try{const r=await complaints.exportCsv();const url=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=url;a.download="complaints_export.csv";a.click();URL.revokeObjectURL(url)}catch(e){setNotice("CSV export failed.")}}
  const stats=summary?.stats||{total:0,pending:0,inProgress:0,resolved:0};
  return <div><PageTitle eyebrow="OFFICER CONSOLE" title="Operations dashboard" text="Prioritize the queue, update progress, and keep the community informed."><button className="btn secondary" onClick={exportCsv}>Export CSV</button></PageTitle>
    {notice&&<div className="alert info">{notice}</div>}
    <div className="stats-grid"><Stat label="Total" value={stats.total}/><Stat label="Pending" value={stats.pending}/><Stat label="In progress" value={stats.inProgress}/><Stat label="Resolved" value={stats.resolved}/></div>
    <div className="ai-card"><div className="ai-icon"><Sparkles size={20}/></div><div><span className="eyebrow">AI OFFICER BRIEFING</span><p>{summary?.summary||"Loading briefing…"}</p></div></div>
    <div className="queue-head"><div><h2>Complaint queue</h2><p className="muted">Sorted by newest reports. Priority is calculated from upvotes and age.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All statuses</option>{["Pending","In Progress","Resolved"].map(s=><option key={s}>{s}</option>)}</select></div>
    {loading?<Loading/>:<div className="officer-list">{items.map(c=><OfficerRow key={c._id} c={c} onUpdate={update}/>)}</div>}
  </div>;
}
function OfficerRow({c,onUpdate}){const [remark,setRemark]=useState(c.officerRemark||"");return <div className="officer-row card"><div className="row-main"><div className="tag-row"><span className={priorityClass(c.priority)}>{c.priority}</span><span className="tag">{c.category}</span></div><Link to={`/complaints/${c._id}`}><h3>{c.title}</h3></Link><p>{truncate(c.description,160)}</p><div className="complaint-meta"><span>📍 {c.area}</span><span>▲ {c.upvotes||0}</span><span>{formatDate(c.createdAt)}</span></div></div><div className="row-controls"><label>Status<select value={c.status} onChange={e=>onUpdate(c._id,e.target.value,remark)}>{["Pending","In Progress","Resolved"].map(s=><option key={s}>{s}</option>)}</select></label><label>Officer remark<input value={remark} onChange={e=>setRemark(e.target.value)} onBlur={e=>onUpdate(c._id,c.status,e.target.value)} placeholder="Add a note…"/></label></div></div>}

function Stat({label,value}){return <div className="stat card"><span>{label}</span><strong>{value}</strong></div>}
function PageTitle({eyebrow,title,text,children}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div><div className="page-actions">{children}</div></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Loading(){return <div className="loading card"><div className="spinner"></div><span>Loading…</span></div>}
function Empty({title,text}){return <div className="empty card"><ClipboardList size={30}/><h3>{title}</h3><p>{text}</p></div>}
function truncate(s,n){return String(s||"").length>n?String(s).slice(0,n)+"…":String(s||"")}
function formatDate(s){if(!s)return "—";return new Date(s).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function useParamsShim(){const match=window.location.pathname.match(/\/complaints\/([^/]+)/);return {id:match?.[1]}}
export default App;