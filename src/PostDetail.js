import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEdit = () => {
    alert('글 수정 기능은 아직 구현되지 않았습니다.');
  };

  const handleDelete = () => {
    alert('글이 삭제되었습니다.');
    navigate('/notice');
  };

  return (
    <div className="post-detail-page">
      <h1>공지사항 상세 페이지</h1>
      <p>글 ID: {id}</p>
      <p>여기에 글의 상세 내용이 표시됩니다.</p>
      <button onClick={handleEdit}>수정</button>
      <button onClick={handleDelete}>삭제</button>
    </div>
  );
}

export default PostDetail; 
 