// ============================================
// AmbientDesk — Calendar
// ============================================

export function initCalendar() {
    const monthElement = document.getElementById("calendar-month");
    const dayElement = document.getElementById("calendar-day");
    const weekdayElement = document.getElementById("calendar-weekday");
    const gridElement = document.getElementById("calendar-grid");

    if (!monthElement || !gridElement) {
        return {
            destroy: () => {}
        };
    }

    let displayedDate = new Date();

    const monthFormatter = new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric"
    });

    const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
        weekday: "long"
    });

    function renderCalendar() {
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();

        const today = new Date();

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const previousMonthDays = new Date(year, month, 0).getDate();

        monthElement.textContent = monthFormatter.format(displayedDate);

        if (dayElement) {
            dayElement.textContent = today.getDate();
        }

        if (weekdayElement) {
            weekdayElement.textContent = weekdayFormatter.format(today);
        }

        const fragment = document.createDocumentFragment();

        const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

        weekdays.forEach((weekday) => {
            const element = document.createElement("span");

            element.className = "calendar-weekday";
            element.textContent = weekday;

            fragment.appendChild(element);
        });

        for (let i = 0; i < 42; i++) {
            let day;
            let date;
            let outsideMonth = false;

            if (i < firstDay) {
                day = previousMonthDays - firstDay + i + 1;
                date = new Date(year, month - 1, day);
                outsideMonth = true;
            } else if (i >= firstDay + totalDays) {
                day = i - firstDay - totalDays + 1;
                date = new Date(year, month + 1, day);
                outsideMonth = true;
            } else {
                day = i - firstDay + 1;
                date = new Date(year, month, day);
            }

            const cell = document.createElement("span");

            cell.className = "calendar-date";
            cell.textContent = day;

            if (outsideMonth) {
                cell.classList.add("outside-month");
            }

            if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            ) {
                cell.classList.add("today");
            }

            fragment.appendChild(cell);
        }

        gridElement.replaceChildren(fragment);
    }

    function previousMonth() {
        displayedDate = new Date(
            displayedDate.getFullYear(),
            displayedDate.getMonth() - 1,
            1
        );

        renderCalendar();
    }

    function nextMonth() {
        displayedDate = new Date(
            displayedDate.getFullYear(),
            displayedDate.getMonth() + 1,
            1
        );

        renderCalendar();
    }

    renderCalendar();

    const midnightCheck = setInterval(() => {
        const now = new Date();

        if (
            now.getDate() !== displayedDate.getDate() &&
            now.getMonth() === displayedDate.getMonth() &&
            now.getFullYear() === displayedDate.getFullYear()
        ) {
            renderCalendar();
        }
    }, 60000);

    return {
        previousMonth,
        nextMonth,
        render: renderCalendar,

        destroy() {
            clearInterval(midnightCheck);
        }
    };
}
