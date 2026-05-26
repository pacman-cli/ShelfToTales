'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { gamificationService } from '../lib/api';
import PageTitle from '../components/layout/PageTitle';
import Swal from 'sweetalert2';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('challenges');

  useEffect(() => {
    Promise.all([
      gamificationService.getChallenges().catch(() => ({ data: [] })),
      gamificationService.getMyChallenges().catch(() => ({ data: [] })),
      gamificationService.getMyAchievements().catch(() => ({ data: [] })),
    ]).then(([c, mc, a]) => {
      setChallenges(c.data?.content || c.data || []);
      setMyChallenges(mc.data?.content || mc.data || []);
      setAchievements(a.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const joinChallenge = async (id) => {
    try {
      await gamificationService.joinChallenge(id);
      Swal.fire({ icon: 'success', title: 'Joined!', timer: 1200, showConfirmButton: false });
      const res = await gamificationService.getMyChallenges();
      setMyChallenges(res.data?.content || res.data || []);
    } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Failed to join', 'error'); }
  };

  return (
    <div className="page-content bg-grey">
      <PageTitle parentPage="Gamification" childPage="Challenges & Achievements"/>
      <div className="container py-4">
        <div className="d-flex gap-2 mb-4">
          <button className={`btn ${tab==='challenges'?'btn-dark':'btn-outline-dark'} rounded-pill px-4`} onClick={() => setTab('challenges')}><i className="fa-solid fa-trophy me-2"/>Challenges</button>
          <button className={`btn ${tab==='my'?'btn-dark':'btn-outline-dark'} rounded-pill px-4`} onClick={() => setTab('my')}><i className="fa-solid fa-star me-2"/>My Progress</button>
          <button className={`btn ${tab==='achievements'?'btn-dark':'btn-outline-dark'} rounded-pill px-4`} onClick={() => setTab('achievements')}><i className="fa-solid fa-medal me-2"/>Achievements</button>
        </div>

        {loading ? <div className="text-center py-5"><div className="spinner-border text-secondary"/></div> : (
          <>
            {tab === 'challenges' && (
              <div className="row g-3">
                {challenges.length > 0 ? challenges.map(ch => (
                  <div key={ch.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold">{ch.name || ch.title}</h6>
                          <span className="badge bg-warning text-dark">{ch.targetCount || ch.goal} books</span>
                        </div>
                        <p className="text-muted small">{ch.description || `Read ${ch.targetCount} books to complete`}</p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <small className="text-muted"><i className="fa-solid fa-calendar me-1"/>{ch.startDate ? new Date(ch.startDate).toLocaleDateString() : 'Ongoing'}</small>
                          <button className="btn btn-sm btn-outline-dark rounded-pill" onClick={() => joinChallenge(ch.id)}>Join</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-5 text-muted"><i className="fa-solid fa-trophy fa-3x opacity-25 mb-3 d-block"/><p>No challenges available yet</p></div>}
              </div>
            )}

            {tab === 'my' && (
              <div className="row g-3">
                {myChallenges.length > 0 ? myChallenges.map(mc => (
                  <div key={mc.id} className="col-md-6">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                      <div className="card-body p-4">
                        <h6 className="fw-bold">{mc.challenge?.name || mc.name || 'Challenge'}</h6>
                        <div className="progress mt-2" style={{ height: 8, borderRadius: 8 }}>
                          <div className="progress-bar" style={{ width: `${Math.min((mc.progress / (mc.challenge?.targetCount || mc.targetCount || 10)) * 100, 100)}%`, background: 'linear-gradient(90deg, #eaa451, #e58c23)', borderRadius: 8 }}/>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <small className="text-muted">{mc.progress || 0} / {mc.challenge?.targetCount || mc.targetCount || 10} books</small>
                          <small className={mc.completed ? 'text-success fw-bold' : 'text-muted'}>{mc.completed ? '✓ Completed' : 'In Progress'}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-5 text-muted"><p>You haven't joined any challenges yet</p></div>}
              </div>
            )}

            {tab === 'achievements' && (
              <div className="row g-3">
                {achievements.length > 0 ? achievements.map(a => (
                  <div key={a.id} className="col-6 col-md-4 col-lg-3">
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 16 }}>
                      <div className="card-body p-3">
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>{a.icon || '🏆'}</div>
                        <h6 className="fw-bold small">{a.name}</h6>
                        <small className="text-muted">{a.description}</small>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-5 text-muted"><i className="fa-solid fa-medal fa-3x opacity-25 mb-3 d-block"/><p>Complete challenges to earn achievements!</p></div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
