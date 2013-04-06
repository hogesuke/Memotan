# coding: utf-8

class LearningController < ApplicationController
  
  layout "learning_layout"
  before_filter LoginFilter.new

  def index

    @tags = Tag.get_tags(session[:usr])
    @count_of_learning = Word.select_learning_words("learning", "all", true, session[:usr])[0]["count"]
    @count_of_test = Word.select_learning_words("test", "all", true, session[:usr])[0]["count"]
  end

  def get_words
    
    words = Word.select_learning_words(params[:category], params[:tag_id], false, session[:usr])
    html = render_to_string :partial => 'learning_word', :locals => {:words => words}
    
    render :json => {:html => html}
  end

  def count_words_at_tag

    count_of_learning = Word.select_learning_words("learning", params[:tag_id], true, session[:usr])[0]["count"]
    count_of_test = Word.select_learning_words("test", params[:tag_id], true, session[:usr])[0]["count"]
    count_of_all_test = Word.select_learning_words("test", "all", true, session[:usr])[0]["count"]
    render :json => {:count_of_learning => count_of_learning, :count_of_test => count_of_test}
  end

  def count_all_test_words

    count_of_all_test = Word.select_learning_words("test", "all", true, session[:usr])[0]["count"]
    render :json => {:count_of_all_test => count_of_all_test}
  end
 
  def reflect_result
    
    learning_result = params[:learning_result]
    
    Word.transaction do
      learning_result.each do |result|
        
        word_id = result[1]['word_id']
        lv_status = result[1]['lv_status']
        
        word = Word.find(word_id)
        word.last_learned_at = Time.now
        
        if lv_status == "up"
          word.levelUp
        elsif lv_status == "down"
          word.levelDown
        end
        
        word.save!
      end
    end
    render :json => {:notice => '学習結果を反映しました。'}
  rescue => e
    render :json => {:notice => '学習結果を反映に失敗しました。'}
    
  end
  
end
