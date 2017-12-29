import React, {Component} from 'react';

import Title from './article/title';
import Content from '../../containers/parts/content';
import Meta from './article/meta';
import PostFooter from '../../containers/parts/post-footer';

export default class Article extends Component {
	getClasses() {
		return this.props.isSingle ? 'card single w-75' : 'card archive';
	}

	getFeaturedImageSrc() {
		if (this.props.post.featured_image_url) {
			return this.props.isSingle ? this.props.post.featured_image_url.large : this.props.post.featured_image_url.full;
		} else {
			return '';
		}
	}

	getFeaturedAudioSrc () {
		return this.props.post.featured_audio_url;
	}

	getCategories(cat_ids) {
		if ('undefined' !== typeof cat_ids) {
			return cat_ids.map(cat_id => {
				return RT_API['categories'].filter(cat => {
					return cat.term_id === cat_id
				})[0];
			});
		}
	}

	getContent(post, isSingle) {
		return (isSingle) ? post.content.rendered : post.excerpt.rendered;
	}

	onClickAudio (src) {
		window.PLAYER.loadSound(src, this.props.post.title.rendered, true);
	}

	render() {
		const post = this.props.post;
		return (
			<article className={this.getClasses()}>
				{ this.getFeaturedImageSrc() && (
					<img src={this.getFeaturedImageSrc()} className="card-img-top img-fluid"/>
				) }
				<div className="card-block">
					<Title link={post.link} isSingle={this.props.isSingle}>
						{post.title.rendered}
					</Title>
					{ this.getFeaturedAudioSrc() && (
						<div className="controls post-controls">
							<button className='control' onClick={ (a) => this.onClickAudio(this.getFeaturedAudioSrc()) }>
					    		<i className='fa fa-play'></i>
					    	</button>
					    </div>
					) }
					<Meta categories={this.getCategories(post.categories)}
					      date={post.date}
					      formattedDate={post.formatted_date}
					      type={post.type}
					      isSingle={this.props.isSingle}/>
					<Content isSingle={this.props.isSingle}>
						{this.getContent(post, this.props.isSingle)}
					</Content>
				</div>
				<PostFooter type={post.type} pId={post.id} isSingle={this.props.isSingle} tagIds={post.tags}
				            commentStatus={post.comment_status}/>
			</article>
		);
	}
}