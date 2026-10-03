import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import Button from '../components/common/Button';
import { UserCheck, AlertCircle } from 'lucide-react';

export default function Register() {
  const { registerParticipant, participant } = useParticipant();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: participant?.name || '',
    participantId: participant?.participantId || '',
    email: participant?.email || '',
    college: participant?.college || '',
    department: participant?.department || '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.participantId.trim()) errs.participantId = 'Participant ID is required';
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Invalid email format';
    }
    if (!form.college.trim()) errs.college = 'College/Institution name is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      await registerParticipant({
        name: form.name.trim(),
        participantId: form.participantId.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        college: form.college.trim(),
        department: form.department.trim(),
      });
      navigate('/rules');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your credentials.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-mono">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F28C0F]">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-wide">
            Participant Registration
          </h2>
          <p className="text-xs text-slate-600">
            Enter your competition credentials to unlock the challenge portal
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold text-slate-700 mb-1">Participant Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F28C0F]"
            />
            {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block uppercase font-bold text-slate-700 mb-1">Participant ID *</label>
            <input
              type="text"
              value={form.participantId}
              onChange={(e) => setForm({ ...form, participantId: e.target.value.toUpperCase() })}
              placeholder="e.g. MC-101"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F28C0F] uppercase font-bold tracking-wider"
            />
            {errors.participantId && <p className="text-rose-500 text-[10px] mt-1">{errors.participantId}</p>}
          </div>

          <div>
            <label className="block uppercase font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@college.edu"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F28C0F]"
            />
            {errors.email && <p className="text-rose-500 text-[10px] mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-slate-700 mb-1">College *</label>
              <input
                type="text"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g. University Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F28C0F]"
              />
              {errors.college && <p className="text-rose-500 text-[10px] mt-1">{errors.college}</p>}
            </div>

            <div>
              <label className="block uppercase font-bold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. CSE / IT"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F28C0F]"
              />
              {errors.department && <p className="text-rose-500 text-[10px] mt-1">{errors.department}</p>}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full font-bold bg-[#F28C0F] hover:bg-orange-500 text-slate-950" disabled={submitting}>
              {submitting ? 'REGISTERING...' : 'CONTINUE TO RULES →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
