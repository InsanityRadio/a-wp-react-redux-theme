import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Howl} from 'howler';
import {fetchPost} from '../actions/index';
import Timecode from 'react-timecode';

class Player extends Component {

    state = {
        playing: false,
        buffering: false,
        title: "Test Info",
        seek: 0,
        duration: 0.1
    }
    
    componentWillMount() {
//        this.props.fetchPost(this.props.location.pathname);
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.path != this.props.path) {
            this.loadSound(nextProps.path);
        }
    }

    loadSound (audio) {

        this.sound && this.sound.unload()
        this.sound = new Howl({
            html5: true,
            src: audio,
            autoplay: this.state.playing,
            onplay: this.soundStateChange.bind(this, 'play'),
            onpause: this.soundStateChange.bind(this, 'pause'),
            onstop: this.soundStateChange.bind(this, 'stop'),
            onend: this.soundStateChange.bind(this, 'end'),
            onseek: this.soundStateChange.bind(this)
        });

        this.setState({ buffering: true, playing: false })

    }

    stopSound () {
        this.sound.unload();
        this.setState({ buffering: false, playing: false })
    }

    soundSeekChange () {

        if (!this.sound) {
            this.setState({ seek: 0, duration: 0.1})
            return;
        }

        console.log(this.sound, '!?')

        this.setState({ seek: this.sound.seek(), duration: this.sound.duration() || 0.1 })
        if (this.state.playing) {
            clearTimeout(this._int);
            this._int = setTimeout(this.soundSeekChange.bind(this), 300);
        }

    }

    seek (time) {
        this.setState({ seek: time })
        this.sound && this.sound.seek(time)
    }

    soundStateChange (event) {
        if (this.sound.state() == "loading") {
            this.setState({ buffering: true })
            this.setSeekEnabled(false)
            return;
        }
        if (this.sound.state() != "loaded" || event == 'end') {
            this.setState({ buffering: false, playing: false })
            this.setSeekEnabled(false)
            return;
        }
        this.setState({ playing: this.sound.playing(), buffering: false }, (a) => {
            this.soundSeekChange()
        })
    }

    clickPlay () {

        if (!this.sound) {
            if (this.props.path) {
                this.setState({ playing: true }, (a) => this.loadSound(this.props.path))
            }
            return;
        }

        if (this.state.playing) {
            this.sound.pause()
        } else {
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
                            onkeydown={ (a) => false }
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