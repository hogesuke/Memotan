# coding: utf-8

class WordsController < ApplicationController

  layout "words_layout"
  before_filter LoginFilter.new
  
  PER_PAGE = 3

  def index
    
    @words = Word.where(:user_id => session[:usr]).order('created_at DESC').paginate(:page => 1, :per_page => PER_PAGE)
    @all_words_count = get_word_count
    @test_words_count = Word.select_learning_words("test", "all", true, session[:usr])[0]["count"]
    @tags = Tag.get_tags(session[:usr])
    @max_level = LearningLevel.maximum(:level)
  end
  
  def list
    
    cond = Word.where(:user_id => session[:usr]).order("created_at DESC")
    
    if params.has_key?("tag_id")
      cond = cond.joins(:tags).where("tags.id = ?", params[:tag_id].to_i)
    end
    
    if params.has_key?("search_key")
      cond = cond.where("spelling like ?", "%#{params[:search_key]}%")
    end
    
    words = cond.paginate(:page => params[:page], :per_page => PER_PAGE)
    if words.empty?
      render :json => {:status => "completed"} and return
    end
    html = render_to_string :partial => 'word_card', :collection => words
    render :json => {:html => html, :page => params[:page], :status => "success"}
    
  end
  
  def show
    @word = Word.find(params[:id])
  end
  
  def new
    @word = Word.new
    @priority_levels = PriorityLevel.all
    @tags = Tag.get_tags(session[:usr])
    
    html = render_to_string :partial => 'form'
    render :json => {:html => html}
  end
  
  def edit
    
    @word = Word.find(params[:id])
    @priority_levels = PriorityLevel.all
    @tags = Tag.get_tags(session[:usr])
    
    html = render_to_string :partial => 'form'
    render :json => {:html => html}
  end
  
  def create
    
    # TODO MySQLのinsert時のデフォルトでいいのでは？
    learning_level = LearningLevel.where(:level => 1);
    if learning_level.empty?
      render :partial => 'error', :locals => {:msg => '登録に失敗しました。'} and return
    end
    
    @word = Word.new(params[:word])
    @word.learning_level_id = learning_level[0].id
    @word.user_id = session[:usr]
    
    Word.transaction do
      if !@word.save
        render :partial => 'error', :locals => {:msg => '登録に失敗しました。'} and return
      end
      
      new_tags = params[:tags_label].gsub(/　/, " ").strip.split(/\s+/).uniq
      add_tags(@word, new_tags)
    end
    
    @tags = Tag.get_tags(session[:usr])
    @words_count = get_word_count
    
  rescue => e
    render :partial => 'error', :locals => {:msg => '登録に失敗しました。' + e.message}
  end
  
  def update
    
    @word = Word.where(:user_id => session[:usr]).find(params[:id])
    tags = @word.tags
    
    old_tags = Hash.new
    tags.each do |tag|
      old_tags[tag.label] = tag.id
    end
    
    new_tags = params[:tags_label].gsub(/　/, " ").strip.split(/\s+/).uniq
    
    add_tags = new_tags.clone
    add_tags.delete_if{|x| old_tags.include?(x)}
    
    delete_tags = old_tags.clone
    delete_tags.delete_if{|key, value| new_tags.include?(key)}
    
    Word.transaction do
      
      # 外されたタグの関連を削除
      delete_tags.each do |key, val|
        @word.tags.delete(Tag.find(val))
      end
      
      # 関連を削除したタグがどのワードにも紐付かない場合、タグを削除する
      delete_tags.each do |key, val|
        if TagsWords.where(:tag_id => val).exists?
          next
        end
        tag = Tag.find(val)
        tag.destroy
      end
      
      # 追加されるタグの登録
      add_tags(@word, add_tags)
      
      # ワードの更新
      @word.update_attributes!(params[:word])
    end
    
    @tags = Tag.get_tags(session[:usr])
    @words_count = get_word_count
    
  rescue => e
    render :partial => 'error', :locals => {:msg => '更新に失敗しました。' + e.message}
  end
  
  def destroy

    @word = Word.where(:user_id => session[:usr]).find(params[:id])
    if !@word.destroy
      render :json => {:status => "failed"}
    end
    
    render :json => {:status => "success"}
  end
  
  def add_tags(word, add_tags)
    
    add_tags.each do |label|
      
      existing_tag = Tag.where(:label => label, :user_id => session[:usr])
      if existing_tag.size == 1
        word.tags << [existing_tag[0]];
        next
      end
      
      new_tag = Tag.new({:label => label, :user_id => session[:usr]})
      new_tag.save!
      word.tags << [new_tag]
    end
  end
  
  def get_word_count
    
    return Word.where(:user_id => session[:usr]).count()
  end
  
end
