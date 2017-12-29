import React, {Component} from 'react';

class InlinePlayer extends Component {

	state = {
		playing: false,
		buffering: false
	}

	defaultState = {
		playing: false,
		buffering: false
	}

	componentWillMount () {
		this.getGlobalPlayer().registerInline(this);
	}

	componentWillUnmount () {
		this.getGlobalPlayer().deregisterInline(this);
	}

    clickPlay () {

    	let player = this.getGlobalPlayer();

        if (player.state.path == this.props.path) {
            player.clickPlay();
        } else {
			player.loadSound(this.props.path, this.props.title, true);
        }

    }

 	handleStateChange (player, newState) {
    	this.setState(newState.path == this.props.path ? newState : this.defaultState);
    }

    getGlobalPlayer () {
    	return window.PLAYER;
    }

    render () {

    	var player = this.getGlobalPlayer();

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
			<div className="controls post-controls">
				<button className='control' onClick={ (a) => this.clickPlay() } title={ buttonStateTitle }>
		    		<i className={ 'fa fa-' + buttonState }></i>
		    	</button>
		    </div>
		)
    }
}

export default InlinePlayer;