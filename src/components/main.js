import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Article from './main/article';
import PageNav from './main/pageNav';

export default class Main extends Component {
    componentWillUpdate() {
        window.scrollTo(0, 0);
    }

    isSingle() {
        return 1 === this.props.posts.length;
    }

    getContentOrExcerpt(post) {
        return this.isSingle() ? post.content.rendered : post.excerpt.rendered;
    }

    renderPosts(posts) {
        return posts.map(post => {
            return <Article key={post.id} title={post.title.rendered} content={this.getContentOrExcerpt(post)}
                            link={post.link} isSingle={this.isSingle()} featuredImage={post.featured_image_url}/>;
        });
    }

    getClasses() {
        return this.isSingle() ? '' : 'card-columns';
    }

    render() {
        return (
            <div>
                <main id="postsContainer" className={this.getClasses()}>
                    <ReactCSSTransitionGroup
                        transitionName="fade"
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={1}>
                        {this.renderPosts(this.props.posts)}
                    </ReactCSSTransitionGroup>
                </main>
                <PageNav pageNum={this.props.pageNum} shouldRender={1 < this.props.posts.length}/>
            </div>
        );
    }
}

