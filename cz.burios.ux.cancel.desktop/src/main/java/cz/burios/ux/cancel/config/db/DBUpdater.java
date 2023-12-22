package cz.burios.ux.cancel.config.db;

import java.sql.Connection;
import java.util.List;

import cz.burios.uniql.metadata.TableMetaData;
import cz.burios.uniql.jpa.utils.JpaMetadataHelper;
import cz.burios.ux.uniql.config.db.DBUpadaterAsbtract;
import cz.burios.ux.uniql.config.db.DBUpdatable;

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
		} catch (Exception e) {
			e.printStackTrace();
		}		
		System.out.println("DBUpdater.updateData( END )");
	}

	protected void syncMetaData() throws Exception {
		System.out.println("DBUpdater.syncMetaData()");
		db.dbmd(dbmd());
		try (Connection conn = this.ds().getConnection()) {
			List<TableMetaData> tables = JpaMetadataHelper.getTables(conn, "cancel");
			db.dbmd().setTables(tables);
			// List<String> managedClassNames = new ArrayList<String>();
			// Map<String, Class<?>> classes = new TreeMap<>();
			
			/*
			Reflections reflections = new Reflections("cz.burios.ux");
			Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(Table.class);
			// System.out.println("annotated: " + annotated);
			for (Class<?> c : annotated) {
				String tableName = c.getDeclaredAnnotation(Table.class).name();
				// System.out.println("tableName: " + tableName);
				System.out.println("------ " + tableName + " ------");
				TableMetaData tmd = tables.stream().filter(t -> t.getName().equals(tableName)).findFirst().orElse(null);  
				ORMapping mapping = new JPAORMapping(c, db.dbmd());
				mapping.setDBMetaData(db.dbmd());
				// System.out.println("mapping: " + mapping);
				if (tmd != null) {
					List<FieldMetaData> columns = JpaMetadataHelper.getColumns(conn, tableName);
					tmd.setFields(columns);
					// List<FieldMetaData> dropColumns = new ArrayList<>(columns);
					for (ColumnMapping cm : mapping.getColumnMappings()) {
						String columnName = cm.getColumn();
						// System.out.println("columnName: " + columnName + ", columns: " + columns);
						FieldMetaData fmd = columns.stream().filter(col -> col.getColumnName().equals(columnName)).findFirst().orElse(null);
						if (fmd == null) {
							try {
								db.sql(db.getConfig().getDialect().sqlForAlterTable(mapping, cm, Operator.ADD, db.dbmd()), new Object[]{});
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					}
				} else {
					try {
						// System.out.println("CREATE TABLE " + tableName);
						db.createTable(c);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				// classes.put(tableName, c);
				// managedClassNames.add("" + c.getCanonicalName());
				break;
			}
			 */
			System.out.println("------  ------");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
}
