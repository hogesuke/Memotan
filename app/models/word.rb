# coding: utf-8

class Word < ActiveRecord::Base
  belongs_to :priority_level
  belongs_to :learning_level
  belongs_to :user
  has_and_belongs_to_many :tags
  
  @@sql_array = YAML.load_file("./db/sql.yml")

  def levelUp
    
    before_lv = self.learning_level.level
    max_lv = LearningLevel.maximum(:level)
    
    if before_lv >= max_lv
      return
    end
    
    after_lv = LearningLevel.where({:level => before_lv + 1})
    if after_lv.size != 1
      raise "学習レベルのレコードを一意に特定できません"
    end
    
    self.learning_level = after_lv[0]
    self.last_level_changed_at = Time.now
  end
  
  def levelDown
    
    before_lv = self.learning_level.level
    min_lv = LearningLevel.minimum(:level)
    
    if before_lv <= min_lv
      return
    end
    
    after_lv = LearningLevel.where({:level => before_lv - 1})
    if after_lv.size != 1
      raise "学習レベルのレコードを一意に特定できません"
    end
    
    self.learning_level = after_lv[0]
    self.last_level_changed_at = Time.now
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
