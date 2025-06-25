import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './PostDetail.css'; // 기존 CSS 재활용

function NoticeDetail() {
  const [notice, setNotice] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetch(`/api/notices/${id}`);
        if (!response.ok) throw new Error('Notice not found');
        const data = await response.json();
        setNotice(data);
      } catch (error) {
        console.error("Error fetching notice:", error);
        navigate('/notice');
      }
    };
    fetchNotice();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/notices/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('삭제에 실패했습니다.');
        }
        alert('공지사항이 삭제되었습니다.');
        navigate('/notice');
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert(error.message);
      }
    }
  };

  if (!notice) {
    return <div className="page-container">Loading...</div>;
  }

  const formattedDate = new Date(notice.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-container post-detail-container">
      <h1 className="post-title">{notice.title}</h1>
      <p className="post-date">{formattedDate}</p>
      <div 
        className="post-content"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />
      <div className="post-actions">
        <Link to="/notice" className="btn">목록으로</Link>
        <Link to={`/notice/${id}/edit`} className="btn btn-secondary">수정</Link>
        <button onClick={handleDelete} className="btn btn-danger">삭제</button>
      </div>
    </div>
  );
}

export default NoticeDetail; 