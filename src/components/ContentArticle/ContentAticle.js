import React, { Component } from 'react';
import './ContentArticle.scss';
import $ from 'jquery';

let noteId = null;

class ContentAticle extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    console.log('변경확인', this.props.currentNoteData);

    const $title = $('h1 input');
    const data = this.props.currentNoteData;
    if (!data) {
      return false;
    }

    // 현재 작성중인 노트일때 업데이트 안함.
    if (editor.target) {
      if (data.id !== noteId) {
        console.log('본문 갱신');
        $title.val(data.title || '');
        editor.update(data.content);
      }
    } else {
      if (data) {
        $title.val(data.title || '');
        editor.init(data.content);
      }
    }

    // 현재 노트 ID저장
    noteId = data.id;
  }

  render() {
    const noteId = null;

    return (
      <main>
        <h1>
          <input type="text" placeholder="제목을 입력하세요." />
        </h1>
        <article>
          <textarea id="editor" placeholder="컨텐츠 영역" />
        </article>
      </main>
    );
  }
}

const editor = {
  target: null,
  timeID: null,
  init: function(data) {
    CKEDITOR.replace('editor');
    const editorObj = CKEDITOR.instances.editor;
    const config = CKEDITOR.config;
    editorObj.setData(data);
    config.height = '80em';
    this.target = editorObj;
    //console.log('editorObj', editorObj, 'config', config);

    editorObj.on('contentDom', function() {
      const editable = editorObj.editable();

      /*
       * 목록 가져오기로 setData() 이후 이벤트가 풀리는 증상 해결.
       * ref: http://stackoverflow.com/questions/16054070/ckeditor-setdata-prevents-attaching-of-events-with-on-function
       */
      editable.attachListener(editorObj.document, 'keyup', function(event) {
        editor.onKeyup(event.data.$);
      });
    });
  },
  update: function(data) {
    this.target.setData(data);
  },
  getTitle: function() {
    return $('h1 input').val();
  },
  getContent: function() {
    return this.target.getData();
  },
  save: function(isTitle) {
    console.log('save', arguments);

    let data = null;
    if (isTitle) {
      data = this.getTitle();
      $.note.updateTitle({
        id: noteId,
        title: data
      });
    } else {
      data = this.getContent();
      $.note.updateNote({
        id: noteId,
        content: data
      });
    }
  },
  /**
   * saveRequest
   * 변경사항이 생길때 1초 초과시 save() 실행
   */
  saveRequest: function(isTitle) {
    const that = this;
    if (this.timeID) {
      clearTimeout(this.timeID);
    }

    this.timeID = setTimeout(function() {
      that.save(isTitle);
    }, 500);
  },
  onKeyup: function(event, isTitle) {
    console.log('onKeyEvent', arguments);
    this.saveRequest(isTitle);
  }
};

export default ContentAticle;