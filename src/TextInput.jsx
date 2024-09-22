import {useEffect, useState} from "react";

const posColors = {
    PROPN: '#fd0000',
    NOUN: '#fd0000',
    VERB: '#00f406',
    ADJ: '#ffc300',
    ADV: '#5900ff',
    PRON: '#ff7100',
    DET: '#7afb00',
    ADP: '#00ed92',
    CONJ: '#fb0077',
    INTJ: '#b700fb',
    PUNCT: '#d1d1d1',
    AUX: '#00f1fb',
    NUM: '#0083ff',
    SYM: '#c17c7c'
};

export const TextInput = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState(<></>);

    const isFirstToken = (token) => token.start === 0;
    const previousChar = (token) => input.at(token.start - 1);
    const previousCharWasWhitespace = (token) => /\s/.test(previousChar(token));
    const shouldAddWhitespaceBeforeToken = (token) => !isFirstToken(token) && previousCharWasWhitespace(token);
    const addProperWhitespace = (token) => shouldAddWhitespaceBeforeToken(token) ? previousChar(token) : '';
    const display = (partOfSpeech, token) =>
        <span
            key={token.start}
            style={{
                color: posColors[partOfSpeech] || 'black',
            }}>
            {addProperWhitespace(token) + token.lemma}
          </span>;

    const colorizeText = (data) => {
        setOutput(Object.entries(data).flatMap(([partOfSpeech, tokens]) =>
            tokens.map((token) => display(partOfSpeech, token))).sort((a, b) => a.key - b.key));
    };

    useEffect(() => {
        const fetchData = async () => {
            if (input.trim() === '') {
                setOutput(<></>);
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/nlp/process-text/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({text: input})
            });

            if (response.ok) {
                const posData = await response.json();
                colorizeText(posData);
            } else {
                throw new Error(response.statusText);
            }
        };

        fetchData().then(() => console.log('Updated successfully')).catch(() => window.alert('Error on fetch :('));
    }, [input]);

    const handleInput = (event) => {
        setInput(event.target.innerText);
    };

    return <>
        <div id="output-box" className="common-box">{output}</div>
        <div id="input-box" className="common-box" contentEditable={true} onInput={handleInput}></div>
    </>
}