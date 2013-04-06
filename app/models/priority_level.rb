class PriorityLevel < ActiveRecord::Base
  
  has_many :words
  
  validates :priority_level,
    :presence => true,
    :uniqueness => true,
    :format => { :with => /^[1-9]{1}$/}
    
  validates :label,
    :presence => true,
    :uniqueness => true,
    :length => { :maximum => 10}
    
end
