# coding: utf-8
require 'spec_helper'

describe LearningController, :type => :controller do
  
  def valid_session
    {:usr => 1}
  end
  
  describe "GET get_list" do
    
    it "renderが行われること" do
      word = FactoryGirl.create(:word_1)
      get :get_list, {:tag_id => word.tags[0].id}, valid_session
      response.should be_success
    end
  end
  
  describe "get_learning_words" do
    
    it "ok" do
      word = FactoryGirl.create(:word_1)
      learning_controller = LearningController.new
      @request.session[:usr] = word.user_id
      
      learning_words = learning_controller.get_learning_words(word.tags[0].id)
      learning_words.should == word
    end
  end
end