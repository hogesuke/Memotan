class AddIndexTagsWords < ActiveRecord::Migration
  def self.up
    add_index :tags_words, :tag_id
    add_index :tags_words, :word_id
  end

  def self.down
    remove_index :tags_words, :tag_id
    remove_index :tags_words, :word_id
  end
end
