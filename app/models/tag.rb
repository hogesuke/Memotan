class Tag < ActiveRecord::Base
  has_and_belongs_to_many :words
  
  def self.get_tags(user_id)
    
    tags = self.find(:all,
                      :select => "tags.id, tags.label, count(tag_id) as count",
                      :conditions => ["user_id = ?", user_id],
                      :joins => "INNER JOIN tags_words ON tags.id = tags_words.tag_id",
                      :group => "tag_id",
                      :order => "count desc"
    )
    return tags
  end
end
