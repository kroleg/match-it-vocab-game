import React, {Component} from 'react';
import './App.css';

const SPREADSHEET_ID = '1O9Nkp5MddsdFbCy4MbxmyySxtDd8ZB6KccWyYAMM-3A';
const API_KEY = 'AIzaSyBs8RFSnZv_Vs1vvFBPZyd4q88M8p_9AMg';

class App extends Component {
    constructor(props) {
        super(props);
        this.matchedWords = [];
        this.matchedDefinitions = [];
        this.left = [];
        this.right = [];
        this.state = {
            chosenWord: '',
            submitEnabled: false,
            submitted: false
        };
        this.vocabulary = {};
    }

    render() {
        return (
            <div className="App">
                <h1>Word matching game</h1>
                <div className="container matched">
                    {this.matchedWords.map((word, index) => <div className={'block-row ' + this.correctnessClass(word, this.matchedDefinitions[index])} >
                        <Block text={word}/>
                        <Block text={this.matchedDefinitions[index]}/>
                    </div>)}
                </div>
                <div className="unmatched container">
                    <div className="words col">
                        {this.left.map(word => <div className='block-row'><Block text={word} selected={word === this.state.chosenWord}
                                                                                 onClick={this.onWordClick}/></div>)}
                    </div>
                    <div className="definitions col">
                        {this.right.map(word => <div className='block-row'><Block text={word} onClick={this.onDefinitionClick}/></div>)}
                    </div>
                </div>
                { this.state.submitted
                    ? <button className='btn btn-play' onClick={this.onPlayAgainClick}>Play more</button>
                    : <button className='btn btn-check' onClick={this.onSubmitClick} disabled={!this.state.submitEnabled}>Submit</button>
                }

            </div>
        );
    }

    correctnessClass = (word, def) => {
        if (!this.state.submitted) {
            return ''
        }
        if (def === this.vocabulary[word]) {
            return 'correct';
        }
        return 'incorrect';
    }

    startGame() {
        const wordsToUse = getRandom(Object.entries(this.vocabulary), 5);
        this.matchedWords = [];
        this.matchedDefinitions = [];
        this.left = wordsToUse.map(w2u => w2u[0]);
        this.right = shuffle(wordsToUse.map(w2u => w2u[1]));
        this.setState({ submitEnabled: false, submitted: false })
    }

    onClick = (event) => {
        console.log(event);
    }

    onPlayAgainClick = () => {
        this.startGame();
    }

    onWordClick = (text) => {
        this.setState({chosenWord: text});
    }

    onSubmitClick = (text) => {
        this.setState({ submitted: true})
    }

    onDefinitionClick = (text) => {
        if (this.state.chosenWord) {
            const wordIndex = this.left.findIndex(word => word === this.state.chosenWord);
            this.matchedWords.push(this.left.splice(wordIndex, 1)[0]);
            const defIndex = this.right.findIndex(d => d === text);
            this.matchedDefinitions.push(this.right.splice(defIndex, 1)[0]);
        }
        this.setState({ chosenWord: '', submitEnabled: this.left.length === 0 });
    }

    componentDidMount() {
        const tabName = window.location.hash ? window.location.hash.replace('#', '') : 'math';
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${tabName}?key=${API_KEY}`).then(async res => {
            if (res.status !== 200) {
                return this.setState({ error: 'Failed to retrieve data from google spreadsheet' });
            }
            const data = await res.json();
            try {
                data.values.forEach(row => {
                    this.vocabulary[row[0]] = row[1];
                });
                this.startGame()
            } catch (err) {
                return this.setState({ error: err.message });
            }

        });
    }
}

class Block extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: false
        }
    }

    render() {
        return <div className={'block ' + (this.props.selected ? 'selected' : '')} onClick={this.onClick}>{this.props.text}</div>;
    }

    onClick = () => {
        if (this.props.onClick) {
            this.props.onClick(this.props.text);
        }
    }
}

export default App;

function getRandom(arr, n) {
    if (n > arr.length) {
        n = arr.length
    }
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}