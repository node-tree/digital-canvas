import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Notice.css';
import AuthContext from './context/AuthContext';

function Notice() {
  const [notices, setNotices] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices');
        const data = await response.json();
        setNotices(data);
      } catch (error) {
        console.error("공지사항 목록을 불러오는 중 오류 발생:", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
      <h1>공지사항</h1>
        {token && (
          <Link to="/notice/new" className="btn">글 등록</Link>
        )}
      </div>
      <div className="notice-list">
        {notices.map(notice => (
          <div key={notice._id} className="notice-item">
            <Link to={`/notice/${notice._id}`} className="notice-item-link">
              <span className="notice-date">
                {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <span className="notice-title">{notice.title}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notice; 