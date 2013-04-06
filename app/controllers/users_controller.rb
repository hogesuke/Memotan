class UsersController < ApplicationController
  
  def new
    @user = User.new
  end
  
  def create
    
    @user = User.new(params[:user])
    @user.roles = "member"
    if @user.save
      render :action => "complete"
      #      redirect_to :controller => "users", :action => "complete"
      #      redirect_to "/users/complete"
      return
    end
    redirect_to :controller => "users", :action => "complete"
  end
  
  def complete
    @user = User.find(1)
  end
end