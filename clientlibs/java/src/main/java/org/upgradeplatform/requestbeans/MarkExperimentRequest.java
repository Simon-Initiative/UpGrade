package org.upgradeplatform.requestbeans;

public class MarkExperimentRequest {

	
	private String userId;
	private String site;
	private String target;
	private String condition;
	private String status;
	
	public MarkExperimentRequest() {}

	public MarkExperimentRequest(String userId, String site, String target, String condition) {
		super();
		this.userId = userId;
		this.site = site;
		this.target = target;
		this.condition = condition;
	}

	public MarkExperimentRequest(String userId, String site, String target, String condition, String status) {
		super();
		this.userId = userId;
		this.site = site;
		this.target = target;
		this.condition = condition;
		this.status = status;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getSite() {
		return site;
	}

	public void setSite(String site) {
		this.site = site;
	}

	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	public String getCondition() {
		return condition;
	}

	public void setCondition(String condition) {
		this.condition = condition;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status){
		this.status = status;
	}
}
