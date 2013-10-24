# coding: utf-8

class Word < ActiveRecord::Base
  belongs_to :learning_level
  belongs_to :user
  has_and_belongs_to_many :tags
  
  @@sql_array = YAML.load_file("./db/sql.yml")

  validates :spelling,
    :presence => true,
    :length => { :maximum => 25 }
  validates :description,
    :length => { :maximum =>  256 }

  def self.level_up(word_id, user_id)
    word = self.where(:id => word_id, :user_id => user_id)

    if word.size == 0
      raise "ワードを取得できませんでした。"
    end

    before_lv = word[0].learning_level.level
    max_lv = LearningLevel.maximum(:level)
    
    if before_lv >= max_lv
      return before_lv
    end
    
    after_lv = LearningLevel.where(:level => before_lv + 1)
    if after_lv.size != 1
      raise "学習レベルのレコードを一意に特定できません"
    end
    
    word[0].learning_level = after_lv[0]
    word[0].last_level_changed_at = Time.now
    word[0].save!

    return after_lv[0].level
  end
  
  def self.level_down(word_id, user_id)
     word = self.where(:id => word_id, :user_id => user_id)

    if word.size == 0
      raise "ワードを取得できませんでした。"
    end

    before_lv = word[0].learning_level.level
    min_lv = LearningLevel.minimum(:level)
    
    if before_lv <= min_lv
      return before_lv
    end
    
    after_lv = LearningLevel.where(:level => before_lv - 1)
    if after_lv.size != 1
      raise "学習レベルのレコードを一意に特定できません"
    end
    
    word[0].learning_level = after_lv[0]
    word[0].last_level_changed_at = Time.now
    word[0].save!

    return after_lv[0].level
  end

  def self.create_tutorial_word(user_id)

    Word.transaction do
      word =self.create!(:user_id => user_id,
                         :learning_level_id => '1',
                         :spelling => 'Memotanへようこそ！ここをクリック！',
                         :description => "ご利用ありがとうございます。\n"\
                                       + "単語の登録について簡単に使い方を説明します。\n"\
                                       + "1. ページ上部にあるペンマークのアイコンをクリック\n"\
                                       + "2. フォームに入力して単語を登録\n"\
                                       + "3. 一覧表示される単語をおぼえる\n"\
                                       + "その他にもソートや習得度レベルの設定も可能です。いろいろ試してみてください！"\
                        )
      new_tag = Tag.create!(:label => 'tutorial', :user_id => user_id)
      word.tags << [new_tag]
    end
  end

  def self.select_learning_words(category, tag_id, isCount, user_id)

    enable_tag = tag_id == "all" ? false : true;
    sql = getSql(category, enable_tag, isCount)
    
    select_count = 10
    if enable_tag

      result = Word.find_by_sql([sql,
                               {:user_id => user_id, :tag_id => tag_id.to_i, :limit => select_count}]);
    else

      result = Word.find_by_sql([sql, {:user_id => user_id, :limit => select_count}]);
    end
    
    return result
  end

  def self.getSql(key_category, enable_tag, isCount)

    if enable_tag
      key_tag = "enable_tag"
    else
      key_tag = "disable_tag"
    end

    if isCount
      key_select = "count"
    else
      key_select = "words"
    end

    return @@sql_array[key_category][key_select][key_tag]
  end
end
