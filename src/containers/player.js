import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Howl} from 'howler';
import {fetchPost} from '../actions/index';
import Timecode from 'react-timecode';

class Audition {

    stateChangeListeners = [];
    presentationDelay = 0;
    audio = null;
    played = false;

    constructor (options) {

        this.options = options;
        this.audio = null;

        var webkit = 'WebkitAppearance' in document.documentElement.style;
        var gecko = 'MozAppearance' in document.documentElement.style;

        this.presentationDelay = webkit ? 10000 : (gecko ? 3000 : 5000);

        let path = this.options.src;
        this.audio = new Audio(path);
        this.audio.addEventListener("playing", (e) => this.handleStateChange(e));
        this.audio.addEventListener("pause", (e) => this.handleStateChange(e));
        this.audio.addEventListener("stalled", (e) => this.handleStateChange(e));
        this.audio.addEventListener("seeking", (e) => this.handleStateChange(e));
        this.audio.addEventListener("seeked", (e) => this.handleStateChange(e));

        this.audio.style.display = 'none';
        document.body.appendChild(this.audio);

        this.options.autoplay && this.play();

    }

    play () {
        this.played = false;
        this.audio.play();
    }

    pause () {
        this.audio.pause();
    }

    stop () {
        this.audio.pause();
        this.audio.parentNode && this.audio.parentNode.removeChild(this.audio);
        this.audio = null;
    }

    get loaded () {
        return this.audio != null;
    }

    get playing() {
        return this.audio != null && this.audio.duration > 0 && !this.audio.paused;
    }

    get buffering() {
        return this.audio != null && (!this.played || this.audio.readyState < this.audio.HAVE_FUTURE_DATA);
    }

    get seek () {
        return this.audio.currentTime;
    }

    get duration () {
        return this.audio.duration;
    }

    seekTo (seek) {
        this.audio.currentTime = seek;
    }

    stateChange (handler) {
        this.stateChangeListeners.push(handler);
    }

    handleStateChange(e) {
        if(this.playing)
            this.played = true;

        this.stateChangeListeners.forEach((a, _) => a(this, e));
    }

    toggle () {
        this.playing ? this.pause() : this.play();
    }

}

class Player extends Component {

    state = {
        playing: false,
        buffering: false,
        title: "",
        seek: 0,
        duration: 0.1
    }
    
    componentWillMount() {
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.path != this.state.path) {
            this.loadSound(nextProps.path);
        }
    }

    loadSound (audio, title, force) {

        if (this.sound) {
            this.sound.stop();
        }
        this.setState({ buffering: true, playing: false, path: audio, ...title && { title: title } })

        this.sound = new Audition({
            src: [audio],
            autoplay: force || this.state.playing,
            onplay: this.soundStateChange.bind(this, 'play'),
            onpause: this.soundStateChange.bind(this, 'pause'),
            onstop: this.soundStateChange.bind(this, 'stop'),
            onend: this.soundStateChange.bind(this, 'end'),
        });

        this.sound.stateChange((sound) => this.soundStateChange())


    }

    stopSound () {
        this.sound.stop();
        this.setState({ buffering: false, playing: false })
    }

    soundSeekChange () {

        if (!this.sound) {
            this.setState({ seek: 0, duration: 0.1})
            return;
        }

        this.setState({ seek: this.sound.seek, duration: this.sound.duration || 0.1 })
        if (this.state.playing) {
            clearTimeout(this._int);
            this._int = setTimeout(this.soundSeekChange.bind(this), 300);
        }

    }

    seek (time) {
        this.setState({ seek: time })
        if (this.sound) {
            this.sound.seekTo(time)
        }
    }

    soundStateChange (event) {
        if (this.sound.buffering) {
            this.setState({ buffering: true })
            this.setSeekEnabled(false)
            return;
        }
        if (!this.sound.loaded) {
            this.setState({ buffering: false, playing: false })
            this.setSeekEnabled(false)
            return;
        }
        console.log('State change', this.sound.playing, this.sound)

        this.setSeekEnabled(true)
        this.setState({ playing: this.sound.playing, buffering: false }, (a) => {
            this.soundSeekChange()
        })
    }

    setSeekEnabled (enabled) {
    }

    clickPlay () {

        if (!this.sound) {
            if (this.state.path) {
                this.setState({ playing: true }, (a) => this.loadSound(this.state.path))
            }
            return;
        }

        if (this.state.playing) {
            this.sound.pause()
        } else {
            this.sound.pause()
            this.sound.play()
        }
    }

    render () {

        var buttonState = "play";
        var buttonStateTitle = "Play";

        if (this.state.buffering) {
            buttonState = "ellipsis-h";
            buttonStateTitle = "Buffering";
        } else if (this.state.playing) {
            buttonState = "pause";
            buttonStateTitle = "Pause";
        }

        return (
            <footer className="footer web-player">
                <div className="container">
                    <div className="info">
                        <p>{ this.state.title }</p>
                    </div>
                    <div className="seek">
                        <b><Timecode time={ this.state.seek * 1000 } /></b>
                        <input
                            type="range"
                            onKeyDown={ (a) => false }
                            min="0"
                            max={ this.state.duration }
                            step="0.05"
                            onChange={ (e) => this.seek(e.target.value) }
                            value={ this.state.seek } />
                        <b><Timecode time={ this.state.duration * 1000 } /></b>
                    </div>
                    <div className="controls">
                        <button className="control" id="go" onClick={ this.clickPlay.bind(this) }>
                            <i
                                className={ "fa fa-" + buttonState }
                                    title={ buttonStateTitle }></i>
                        </button>
                    </div>
                </div>
            </footer>
        );

    }

}


export default Player;