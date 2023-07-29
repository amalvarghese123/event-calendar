import { useState, useEffect, useMemo, Fragment } from "react";
import "./index.css";

const monthMap = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getMonthIndex = (monthLabel) => monthMap.indexOf(monthLabel);
const weekDayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({
  monthInitialValue = monthMap[new Date().getMonth()],
  yearInitialValue = new Date().getFullYear(),
  isLeapYr,
  isStartWithMonday,
}) => {
  const [month, setMonth] = useState(monthInitialValue);
  const [year, setYear] = useState(yearInitialValue);

  const firstDayOfMonth = useMemo(
    () => weekDayMap[new Date(year, getMonthIndex(month), 1).getDay()],
    [month, year]
  );

  const weekDays = useMemo(
    () =>
      isStartWithMonday
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [isStartWithMonday]
  );

  const daysInMonth = useMemo(() => {
    if (month === "Feb") {
      return isLeapYr ? 29 : 28;
    }
    if (["Jan", "Mar", "May", "Jul", "Aug", "Oct", "Dec"].includes(month)) {
      return 31;
    }
    return 30;
  }, [month, isLeapYr]);

  const days = useMemo(
    () => [...Array(daysInMonth)].map((_, idx) => idx + 1),
    [daysInMonth]
  );

  const columnOffset = useMemo(
    () => (weekDays.indexOf(firstDayOfMonth) + 1).toString(),
    [firstDayOfMonth, weekDays]
  );

  //date selection
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateSelectionType, setDateSelectionType] = useState("single");

  const handleDateSelection = (e) => {
    const currentSelection = e.target.dataset.date;
    if (dateSelectionType === "single") {
      setSelectedDates((prev) =>
        prev[0] === currentSelection ? [] : [currentSelection]
      );
    } else if (dateSelectionType === "multiple") {
      setSelectedDates((prev) => {
        const temp = [...prev];
        const idx = temp.indexOf(currentSelection);
        if (idx !== -1) {
          temp.splice(idx, 1);
        } else temp.push(currentSelection);
        return temp;
      });
    } else if (dateSelectionType === "range") {
      setSelectedDates((prev) => {
        if (!prev.length) {
          return [currentSelection];
        } else {
          // const [start, end] =
          //   new Date(prev[0]) < new Date(currentSelection)
          //     ? [new Date(prev[0]), new Date(currentSelection)]
          //     : [new Date(currentSelection), new Date(prev.at(-1))];
          //below code is same as above only with let variables
          let start = new Date(prev[0]);
          let end = new Date(currentSelection);
          if (end < start) {
            [start, end] = [end, new Date(prev.at(-1))];
          }
          const dates = [];
          while (start <= end) {
            dates.push(start.toDateString().slice(4));
            start.setDate(start.getDate() + 1);
          }
          return dates;
        }
      });
    }
  };

  useEffect(() => {
    setSelectedDates([]);
  }, [dateSelectionType]);

  const cancelSelection = () => {
    setDateSelectionType(undefined);
    setError(null);
  };

  //change month
  const changeMonth = (e) => setMonth(e.target.dataset.month);
  //change yr
  const incrementYear = () => {
    setYear((prev) => prev + 1);
    setMonth("Jan");
  };
  const decrementYear = () => {
    setYear((prev) => prev - 1);
    setMonth("Dec");
  };
  //add events to calendar
  const [event, setEvent] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDates.length) setError(null);
  }, [selectedDates]);

  const manageEvent = () => {
    if (!selectedDates.length) {
      setError((prev) => ({
        ...prev,
        addEvent: "Please select at least 1 date to add event",
      }));
    } else {
      setIsOpen(true);
    }
  };
  //event dialogue
  const [isOpen, setIsOpen] = useState(false);
  const [eventDescription, setEventDescription] = useState("");

  const addEventDescription = (e) => {
    if (e.target.value !== "") setError(null);
    setEventDescription(e.target.value);
  };

  const addEvent = () => {
    if (!eventDescription) {
      setError((prev) => ({ ...prev, eventDescription: "Required field" }));
    } else {
      setEvent((prev) => {
        const newEvents = {};
        for (const dt of selectedDates) {
          newEvents[dt] = [...(prev[dt] || []), eventDescription];
        }
        return { ...prev, ...newEvents };
      });
      setEventDescription("");
      setIsOpen(false);
      setSelectedDates([]);
    }
  };

  const closeEventDialogue = () => setIsOpen(false);
  useEffect(() => {
    console.log(event);
  }, [event]);

  return (
    <>
      <div className={`wpr ${isOpen ? "event-dialogue-open" : ""}`}>
        <SelectDates
          dateSelectionType={dateSelectionType}
          setDateSelectionType={setDateSelectionType}
        />
        {error?.addEvent && <div className="text-danger">{error.addEvent}</div>}
        <button onClick={manageEvent}>Add event</button>{" "}
        <button onClick={cancelSelection}>Cancel</button>
        {/* <div>
          Selected dates are:{" "}
          {selectedDates.map((dt) => (
            <span key={dt}>{dt}</span>
          ))}
        </div> */}
        <div>
          {monthMap.map((el) =>
            el === month ? (
              <strong key={el}>{el} </strong>
            ) : (
              <span key={el} onClick={changeMonth} data-month={el}>
                {el}{" "}
              </span>
            )
          )}
        </div>
        <button onClick={decrementYear}>Prev</button>
        <span> {year} </span>
        <button onClick={incrementYear}>Next</button>
        <header className="grid-cntr">
          {weekDays.map((weekDay) => {
            return <div key={weekDay}>{weekDay}</div>;
          })}
        </header>
        <hr />
        <br />
        <section className="grid-cntr">
          {days.map((day) => {
            return (
              <div
                className={`grid-item date-cell ${
                  selectedDates.includes(
                    `${month} ${day < 10 ? "0" + day : day} ${year}`
                  )
                    ? "selected"
                    : ""
                } ${
                  Object.keys(event).includes(
                    `${month} ${day < 10 ? "0" + day : day} ${year}`
                  )
                    ? "event-present"
                    : ""
                }`}
                style={{ gridColumnStart: day === 1 ? columnOffset : "auto" }}
                // style={day === 1 ? { gridColumnStart: columnOffset } : {}}
                key={day}
                onClick={handleDateSelection}
                data-date={`${month} ${day < 10 ? "0" + day : day} ${year}`}
              >
                {day}
              </div>
            );
          })}
        </section>
        <section className="event-cntr">
          <div>
            <label>Add event</label>
          </div>
          <input
            type="text"
            value={eventDescription}
            onChange={addEventDescription}
          />{" "}
          <button onClick={addEvent}>Add</button>{" "}
          <button onClick={closeEventDialogue}>close</button>
          {error?.eventDescription && (
            <div className="text-danger">{error.eventDescription}</div>
          )}
        </section>
      </div>
    </>
  );
};
export default Calendar;

const SelectDates = ({ dateSelectionType, setDateSelectionType }) => {
  const selectionTypes = ["single", "multiple", "range"];
  const handlChange = (e) => setDateSelectionType(e.target.value);
  return (
    <div>
      <label>Select date: </label>
      {selectionTypes.map((type) => {
        return (
          <Fragment key={type}>
            <input
              type="radio"
              value={type}
              onChange={handlChange}
              checked={type === dateSelectionType}
            />
            <label>{type}</label>
          </Fragment>
        );
      })}
    </div>
  );
};
