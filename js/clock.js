/* =========================================
   AMBIENTDESK — LIVE CLOCK
   File: js/clock.js
========================================= */

export function initClock() {

    const elements = {

        greeting: document.getElementById("greeting"),

        hours: document.getElementById("hours"),

        minutes: document.getElementById("minutes"),

        seconds: document.getElementById("seconds"),

        period: document.getElementById("period"),

        date: document.getElementById("clock-date")

    };


    let use24Hour = false;

    let showSeconds = true;

    let previousTime = {

        hours: "",
        minutes: "",
        seconds: ""

    };


    /* =====================================
       GET GREETING
    ===================================== */

    function getGreeting(hour) {

        if (hour >= 5 && hour < 12) {

            return "Good morning";

        }

        if (hour >= 12 && hour < 17) {

            return "Good afternoon";

        }

        if (hour >= 17 && hour < 21) {

            return "Good evening";

        }

        return "Good night";

    }


    /* =====================================
       FORMAT NUMBER
    ===================================== */

    function formatNumber(number) {

        return String(number).padStart(2, "0");

    }


    /* =====================================
       UPDATE CLOCK DIGIT
    ===================================== */

    function updateDigit(element, value, key) {

        if (!element) return;

        if (previousTime[key] === value) return;

        element.textContent = value;

        element.classList.remove("digit-update");

        /* Restart animation */

        void element.offsetWidth;

        element.classList.add("digit-update");

        previousTime[key] = value;

    }


    /* =====================================
       UPDATE DATE
    ===================================== */

    function updateDate(date) {

        if (!elements.date) return;

        const dateText = new Intl.DateTimeFormat(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);

        elements.date.textContent = dateText;

    }


    /* =====================================
       UPDATE GREETING
    ===================================== */

    function updateGreeting(hour) {

        if (!elements.greeting) return;

        const greeting = getGreeting(hour);

        if (elements.greeting.textContent !== greeting) {

            elements.greeting.textContent = greeting;

        }

    }


    /* =====================================
       MAIN CLOCK UPDATE
    ===================================== */

    function updateClock() {

        const now = new Date();

        const actualHour = now.getHours();

        let hour = actualHour;

        let period = "";


        /* 12-hour format */

        if (!use24Hour) {

            period = actualHour >= 12 ? "PM" : "AM";

            hour = actualHour % 12;

            if (hour === 0) {

                hour = 12;

            }

        }


        const hourText = formatNumber(hour);

        const minuteText = formatNumber(
            now.getMinutes()
        );

        const secondText = formatNumber(
            now.getSeconds()
        );


        updateDigit(
            elements.hours,
            hourText,
            "hours"
        );

        updateDigit(
            elements.minutes,
            minuteText,
            "minutes"
        );

        if (showSeconds) {

            updateDigit(
                elements.seconds,
                secondText,
                "seconds"
            );

        }


        /* AM / PM */

        if (elements.period) {

            elements.period.textContent = period;

            elements.period.style.display =
                use24Hour ? "none" : "";

        }


        /* Greeting */

        updateGreeting(actualHour);


        /* Date */

        if (
            now.getSeconds() === 0 ||
            !elements.date?.textContent
        ) {

            updateDate(now);

        }

    }


    /* =====================================
       12 / 24 HOUR FORMAT
    ===================================== */

    function set24Hour(enabled) {

        use24Hour = Boolean(enabled);

        previousTime.hours = "";

        updateClock();

    }


    /* =====================================
       SECONDS VISIBILITY
    ===================================== */

    function setShowSeconds(enabled) {

        showSeconds = Boolean(enabled);

        const secondsUnit =
            elements.seconds?.closest(".clock-unit");

        const secondsSeparator =
            document.querySelector(
                ".seconds-separator"
            );

        if (secondsUnit) {

            secondsUnit.style.display =
                showSeconds ? "" : "none";

        } else if (elements.seconds) {

            elements.seconds.style.display =
                showSeconds ? "" : "none";

        }

        if (secondsSeparator) {

            secondsSeparator.style.display =
                showSeconds ? "" : "none";

        }

        previousTime.seconds = "";

        updateClock();

    }


    /* =====================================
       INITIALIZE CLOCK
    ===================================== */

    updateClock();

    const interval = setInterval(
        updateClock,
        250
    );


    /* =====================================
       PUBLIC API
    ===================================== */

    return {

        update: updateClock,

        set24Hour,

        setShowSeconds,

        getGreeting,

        destroy() {

            clearInterval(interval);

        }

    };

}
