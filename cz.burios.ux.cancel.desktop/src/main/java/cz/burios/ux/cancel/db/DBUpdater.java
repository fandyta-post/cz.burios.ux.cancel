package cz.burios.ux.cancel.db;

import java.sql.Connection;
import java.util.List;
import java.util.Set;

import javax.persistence.Table;

import org.reflections.Reflections;

import cz.burios.uniql.metadata.FieldMetaData;
import cz.burios.uniql.metadata.TableMetaData;
import cz.burios.uniql.sql.Operator;
import cz.burios.ux.core.model.UserAccount;
import cz.burios.ux.security.model.UserCredentials;
import cz.burios.ux.uniql.config.db.DBUpadaterAsbtract;
import cz.burios.ux.uniql.config.db.DBUpdatable;
import cz.burios.uniql.jpa.dialect.ISQLDialect;
import cz.burios.uniql.jpa.mapping.ColumnMapping;
import cz.burios.uniql.jpa.mapping.JPAORMapping;
import cz.burios.uniql.jpa.mapping.ORMapping;
import cz.burios.uniql.jpa.utils.JpaMetadataHelper;

@DBUpdatable
public class DBUpdater extends DBUpadaterAsbtract {
	
	@Override
	public void updateStructure() throws Exception {
		System.out.println("DBUpdater.updateStructure( START )");
		try {
			syncMetaData();
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println("DBUpdater.updateStructure( END )");
	}

	@Override
	public void updateData() throws Exception {
		System.out.println("DBUpdater.updateData( START )");
		try {
			// db.insert(new BankAccount("BANK-000A-0100000011", "Dytrych Jaroslav - KB Běžný účet", "CZ3001000000515845250207", "KOMBCZPP", "CZ", "000051", "5845250207", "0100", new BankInstitution("BANK-000I-00KOMBCZPP")));
			
			/* d3x.J4r1n */
			db.merge(new UserCredentials("US01_000000000000000", "US00_000000000000000", "admin", "$2a$10$r.j1bQw7dD772pNzZ6xMj.FP3WoTzg8tVMP2s5sVUhIC5Wbd9VMuq", "ROLE_SUPERVISOR", "LOCAL", Boolean.TRUE));
			db.merge(new UserAccount("US00_000000000000000", "Josef", "Burian", "buriosca@outlook.cz", Boolean.TRUE));
			db.merge(new UserCredentials("US01_000000000000001", "US00_000000000000001", "fandyta", "$2a$10$r.j1bQw7dD772pNzZ6xMj.FP3WoTzg8tVMP2s5sVUhIC5Wbd9VMuq", "ROLE_ADMIN", "LOCAL", Boolean.TRUE));
			db.merge(new UserAccount("US00_000000000000001", "František", "Dytmar", "fandyta@post.cz", Boolean.TRUE));
			db.merge(new UserCredentials("US01_000000000000002", "US00_000000000000002", "demo", "$2a$10$YUAv3q3RxCSBKdjbsBngeO4/AB.gSiMzGZDomI4f1YCXeshdQLTW6", "ROLE_USER", "LOCAL", Boolean.TRUE));
			db.merge(new UserAccount("US00_000000000000002", "Josef", "Novák", "demo@example.com", Boolean.TRUE));
		
		} catch (Exception e) {
			e.printStackTrace();
		}		
		System.out.println("DBUpdater.updateData( END )");
	}

	/*
	protected void syncMetaData() throws Exception {
		System.out.println("DBUpdater.syncMetaData()");
		try (Connection conn = this.ds().getConnection()) {
			// DatabaseMetaData dmd = conn.getMetaData();
			// String databaseName = dmd.getDatabaseProductName();
			ISQLDialect dialect = db.dialect();
			System.out.println("dialect: " + dialect);
			
			List<TableMetaData> tables = JpaMetadataHelper.getTables(conn, getDatabaseName());
			// System.out.println("tables: " + tables);
			db.dbmd().setTables(tables);

			Reflections reflections = new Reflections("cz.burios.ux");
			Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(Table.class);
			
			for (Class<?> c : annotated) {
				ORMapping mapping = new JPAORMapping(c, db.dbmd());
				String tableName = mapping.getTable();
				System.out.println("----- [" + tableName + "] ---------------");
				TableMetaData tmd = db.dbmd().getTables().stream().filter(t -> t.getName().equals(tableName)).findFirst().orElse(null);
				if (tmd != null) {
					List<FieldMetaData> columns = JpaMetadataHelper.getColumns(conn, tableName, getDatabaseName());
					tmd.setFields(columns);
					// System.out.println("columns: " + tmd.getFields());
					for (ColumnMapping columnMapping : mapping.getColumnMappings()) {
						// System.out.println("-- columnName: " + columnMapping.getColumn());
						FieldMetaData fmd = columns.stream().filter(col -> col.getColumnName().equals(columnMapping.getColumn())).findFirst().orElse(null);
						// System.out.println("fmd: " + fmd);
						if (fmd == null) {
							try {
								db.execute(db.getConfig().getDialect().sqlForAlterTable(mapping, columnMapping, Operator.ADD, db.dbmd()));
							} catch (Exception e) {
								e.printStackTrace();
							}
						} else {
							// System.out.println("fmd.DataType: " + fmd.getDataType());
							boolean eq = columnMapping.equals(fmd);
							// System.out.println("eq: " + eq);
							if (!eq) {
								String sql = db.getConfig().getDialect().sqlForAlterTable(mapping, columnMapping, Operator.MODIFY, db.dbmd());
								System.out.println("sql: " + sql);
								db.execute(sql);
							}
						}
					}
				} else {
					db.createTable(c);
				}
			}
			// System.out.println("----- [ END ] ---------------");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	*/
	@Override
	public String getDatabaseName() {
		return "cancel";
	}
	
	@Override
	public String getReflectionsPackage() {
		return "cz.burios.ux";
	}

}