import React, { useEffect, useState } from 'react';
import '../style/style.css';

function PollCreateComponent() {
    const [optionCount, setOptionCount] = useState(2);
    const [options, setOptions] = useState([{ id: 1, value: '' }, { id: 2, value: '' }]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        window.Telegram.WebApp.ready();
        applyTelegramStyles();
    }, []);

    const applyTelegramStyles = () => {
        const themeParams = window.Telegram.WebApp.themeParams;
        document.documentElement.style.setProperty('--bg-color', themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--text-color', themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--button-color', themeParams.button_color || '#0088cc');
        document.documentElement.style.setProperty('--button-text-color', themeParams.button_text_color || '#ffffff');
    };

    const addOption = () => {
        if (optionCount >= 10) return;

        setOptionCount(optionCount + 1);
        setOptions([...options, { id: optionCount + 1, value: '' }]);
    };

    const deleteOption = (index) => {
        if (optionCount <= 2) return;

        setOptionCount(optionCount - 1);
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleInputChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].value = value;
        setOptions(newOptions);
        checkFormValidity();
    };

    const checkFormValidity = () => {
        const allFilled = options.every(option => option.value.trim() !== '');
        if (title.trim() !== '' && options.length >= 2 && allFilled) {
            window.Telegram.WebApp.MainButton.setText("Создать");
            window.Telegram.WebApp.MainButton.show();
            window.Telegram.WebApp.MainButton.enable();
        } else {
            window.Telegram.WebApp.MainButton.hide();
        }
    };

    //del
    const sendData = () => {
        const pollData = {
            title: title.trim(),
            availableAnswers: options.map((option, index) => ({
                title: option.value.trim(),
                position: index + 1
            }))
        };

        console.log(JSON.stringify(pollData));

        fetch('/api/tg-schedule-bot/polls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pollData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    //-del

    useEffect(() => {
        window.Telegram.WebApp.MainButton.onClick(() => {
            const data = {
                title: title.trim(),
                options: options.map(option => option.value.trim()).filter(value => value !== '')
            };
            window.Telegram.WebApp.sendData(JSON.stringify(data));
        });
    }, [title, options]);

    return (
        <form id="createPollForm" onSubmit={(e) => e.preventDefault()}>
            <div>
                <label htmlFor="title">Заголовок:</label>
                <input
                    id="title"
                    type="text"
                    placeholder="Введите заголовок"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onInput={checkFormValidity}
                />
            </div>
            <div>
                <label>Варианты ответа:</label>
                <div id="optionsContainer">
                    {options.map((option, index) => (
                        <div key={option.id}>
                            <label htmlFor={`option${option.id}`}>{index + 1}.</label>
                            <input
                                id={`option${option.id}`}
                                type="text"
                                placeholder="Введите вариант ответа"
                                value={option.value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                            />
                            <button type="button" onClick={() => deleteOption(index)} disabled={optionCount <= 2}>
                                -
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <button id="addOptionButton" type="button" onClick={addOption} disabled={optionCount >= 10}>
                Добавить вариант
            </button>

            <button id="addOptionButton" type="button" onClick={sendData} disabled={optionCount >= 10}>
                Отправить
            </button>
        </form>
    );
}

export default PollCreateComponent;