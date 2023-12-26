package cz.burios.ux.cancel.bank;


import cz.burios.ux.uniql.config.db.DBUpadaterAsbtract;
import cz.burios.ux.uniql.config.db.DBUpdatable;

@DBUpdatable
public class DBUpdater extends DBUpadaterAsbtract {

	@Override
	public void execute() {
		try {
			updateStructure();
			updateData();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void updateStructure() throws Exception {
		try {
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void updateData() throws Exception {
		try {
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public String getDatabaseName() {
		return "cancel";
	}

	@Override
	public String getReflectionsPackage() {
		return "cz.burios.ux";
	}

}
