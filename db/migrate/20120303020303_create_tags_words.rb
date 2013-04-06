class CreateTagsWords < ActiveRecord::Migration
  def self.up
    create_table :tags_words, :id => false do |t|
      t.references :tag
      t.references :word
    end
  end

  def self.down
    drop_table :tags_words
  end
end
