import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Reservation.css';
import AuthContext from './context/AuthContext';

const renderEventContent = (eventInfo) => {
  const { view, event } = eventInfo;
  // 월(Month) 보기일 경우
  if (view.type === 'dayGridMonth') {
    return (
      <div className="fc-event-month-view">
        <span className="fc-event-dot" style={{ backgroundColor: event.backgroundColor }}></span>
        <div className="fc-event-title-month">{event.title}</div>
      </div>
    );
  }
  // 주(Week) 또는 일(Day) 보기일 경우
  return (
    <div className="fc-event-timegrid-view">
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{event.title}</div>
    </div>
  );
};

// 10분 단위 시간 옵션을 생성하는 헬퍼 함수
const generateTimeOptions = () => {
  const options = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue; // 18:00 까지만 포함
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};

// 새로운 예약을 생성하는 폼 컴포넌트
const ReservationForm = ({ onAddEvent }) => {
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const { token } = useContext(AuthContext);

  const [availableSpaces, setAvailableSpaces] = useState([]);
  const availableEquipment = [
    '니콘 DSLR 카메라',
    '소니 캠코더',
    '360 카메라(교내연구소만 가능)',
    'LED 조명',
    '줌 사운드 레코더',
    '현장답사용 마이크리시버',
    '3D프린터',
    '레이저각인기'
  ];

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch('/api/spaces');
        const data = await response.json();
        setAvailableSpaces(data);
      } catch (error) {
        console.error("Error fetching spaces:", error);
      }
    };
    fetchSpaces();
  }, []);

  const handleCheckboxChange = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if ((selectedSpaces.length === 0 && selectedEquipment.length === 0) || !date || !startTime || !endTime) {
      alert('예약할 항목을 선택하고, 모든 시간 필드를 입력해주세요.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      alert('시작 시간은 종료 시간보다 빨라야 합니다.');
      return;
    }

    const reservationsToCreate = [
      ...selectedSpaces.map(space => ({ title: space.title, type: 'space' })),
      ...selectedEquipment.map(item => ({ title: item, type: 'equipment' })),
    ];

    try {
      for (const res of reservationsToCreate) {
        const newReservation = {
          title: res.title,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          type: res.type,
        };
        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newReservation),
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('인증되지 않았습니다. 다시 로그인해주세요.');
          }
          throw new Error(`'${res.title}' 예약 생성에 실패했습니다.`);
        }
        
        const savedReservation = await response.json();
        onAddEvent(savedReservation);
      }

      // 폼 초기화
      setSelectedSpaces([]);
      setSelectedEquipment([]);
      setDate('');
      setStartTime('');
      setEndTime('');
      alert('예약이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert(error.message);
    }
  };

  return (
    <div className="reservation-form-container">
      <h2>새 예약 등록</h2>
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-row">
          <div className="form-group checklist-group">
            <label>공간 리스트</label>
            <div className="checklist-box">
              {availableSpaces.map(space => (
                <div key={space._id} className="checkbox-item">
                  <input type="checkbox" id={`space-${space._id}`} checked={selectedSpaces.some(s => s._id === space._id)} onChange={() => handleCheckboxChange(selectedSpaces, setSelectedSpaces, space)} />
                  <label htmlFor={`space-${space._id}`}>{space.title}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group checklist-group">
            <label>장비 리스트</label>
            <div className="checklist-box">
            {availableEquipment.map(item => (
              <div key={item} className="checkbox-item">
                <input type="checkbox" id={`equip-${item}`} checked={selectedEquipment.includes(item)} onChange={() => handleCheckboxChange(selectedEquipment, setSelectedEquipment, item)} />
                <label htmlFor={`equip-${item}`}>{item}</label>
              </div>
            ))}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>시작 시간</label>
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
              <option value="" disabled>-- 선택 --</option>
              {timeOptions.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>종료 시간</label>
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)} required>
              <option value="" disabled>-- 선택 --</option>
              {timeOptions.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn submit-btn">등록하기</button>
      </form>
    </div>
  );
};

function Reservation() {
  const [events, setEvents] = useState([]);
  const { token } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 화면 너비에 따라 초기 뷰를 결정하는 함수
  const getInitialView = () => {
    return window.innerWidth <= 768 ? 'timeGridFourDay' : 'timeGridWeek';
  };

  const formatEvent = (reservation) => ({
    id: reservation._id,
    title: reservation.title,
    start: new Date(reservation.start),
    end: new Date(reservation.end),
    allDay: false,
    backgroundColor: reservation.type === 'space' ? '#f39c12' : '#3498db',
    borderColor: reservation.type === 'space' ? '#f39c12' : '#3498db',
  });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/schedules');
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const data = await response.json();
        setEvents(data.map(formatEvent));
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);
  
  const handleAddEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, formatEvent(newEvent)]);
  };

  const handleEventClick = async (clickInfo) => {
    if (!token) {
      setSelectedEvent(clickInfo.event);
      setIsModalOpen(true);
    } else {
      if (window.confirm(`'${clickInfo.event.title}' 예약을 삭제하시겠습니까?`)) {
        try {
          const response = await fetch(`/api/schedules/${clickInfo.event.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new Error('인증되지 않았습니다. 다시 로그인해주세요.');
            }
            throw new Error('예약 삭제에 실패했습니다.');
          }
          // UI에서 즉시 이벤트 제거
          setEvents(prevEvents => prevEvents.filter(event => event.id !== clickInfo.event.id));
          alert('예약이 삭제되었습니다.');
        } catch (error) {
          console.error('Error deleting reservation:', error);
          alert(error.message);
        }
      }
    }
  };

  return (
    <div className="page-container reservation-container">
      <div className="page-header">
        <h1>공간예약신청 일정</h1>
        <a href="https://naver.me/5mh9frmx" target="_blank" rel="noopener noreferrer" className="btn">공간예약신청</a>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={getInitialView()}
        views={{
          timeGridFourDay: {
            type: 'timeGrid',
            duration: { days: 4 },
            buttonText: '4일',
          },
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridFourDay,timeGridDay',
        }}
        events={events}
        locale="ko" // 한글 설정
        buttonText={{
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
        }}
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="19:00:00"
        height="auto"
        eventContent={renderEventContent}
        eventClick={handleEventClick}
      />
      
      {token && <ReservationForm onAddEvent={handleAddEvent} />}

      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>예약 상세 정보</h3>
            <p><strong>항목:</strong> {selectedEvent.title}</p>
            <p><strong>시작:</strong> {selectedEvent.start.toLocaleString('ko-KR')}</p>
            <p><strong>종료:</strong> {selectedEvent.end.toLocaleString('ko-KR')}</p>
            <button onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reservation; 