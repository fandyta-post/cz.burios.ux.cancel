package cz.burios.ux.cancel.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cz.burios.ux.cancel.dao.UserCredentialsDao;
import cz.burios.ux.cancel.model.UserCredentials;

@Service
public class UserCredentialsService {

	@Autowired private UserCredentialsDao dao;

	public UserCredentials getRecord(final String id) {
		return dao.getRecord(id);
	}

	public List<UserCredentials> getRecordByWhere(String where, Object... params) {
		return dao.getRecordByWhere(where, params);
	}
	
	public List<UserCredentials> getRecords() {
		return dao.getRecords();
	}

	public void addRecord(final UserCredentials record) {
		dao.addRecord(record);
	}

	public void updateRecord(final UserCredentials record) {
		dao.updateRecord(record);
	}

	public void deleteRecord(final String id) {
		System.out.println("UserCredentialsService.deleteRecord()");
		dao.deleteRecord(id);
	}

	public UserCredentialsDao dao() {
		return dao;
	}
}
