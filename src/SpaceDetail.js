import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PostDetail.css';
import AuthContext from './context/AuthContext';

function SpaceDetail() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await fetch(`/api/spaces/${id}`);
        if (!response.ok) throw new Error('Failed to fetch space details');
        const data = await response.json();
        setSpace(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching space details:", error);
        setError(error);
        setLoading(false);
      }
    };
    fetchSpace();
  }, [id]);

  if (loading) return <div className="page-container">Loading...</div>;
  if (error) return <div className="page-container">Error fetching data.</div>;
  if (!space) return <div className="page-container">No data found.</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{space.title}</h1>
        {token && (
          <Link to={`/space/${id}/edit`} className="btn">수정하기</Link>
        )}
      </div>
      <div className="post-content" dangerouslySetInnerHTML={{ __html: space.content }} />
    </div>
  );
}

export default SpaceDetail; 