package cz.burios.ux.cancel.bank.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IBankTransaction {

	public String getId();

	public void setId(String id);

	public BankAccount getAccount();

	public void setAccount(BankAccount account);

	public LocalDate getExecutionDate();

	public void setExecutionDate(LocalDate executionDate);

	public BankAccount getRecipientAccountRef();

	public void setRecipientAccountRef(BankAccount recipientAccount);

	public String getRecipientAccount();

	public void setRecipientAccount(String recipientAccount);

	public BigDecimal getAmount();

	public void setAmount(BigDecimal amount);

	public String getReferenceNumber();

	public void setReferenceNumber(String referenceNumber);

	public String getReference();

	public void setReference(String reference);

	public String getNote();

	public void setNote(String note);

	// ------------------------------


	public String getValuation();

	public void setValuation(String valuation);

	public String getPartnerName();

	public void setPartnerName(String partnerName);


	public String[] getCategories();

	public void setCategories(String[] categories);

	public String getFavorite();

	public void setFavorite(String favorite);

	public String getConstantSymbol();

	public void setConstantSymbol(String constantSymbol);

	public String getVariableSymbol();

	public void setVariableSymbol(String variableSymbol);

	public String getSpecificSymbol();

	public void setSpecificSymbol(String specificSymbol);

	public String getReceiverReference();

	public void setReceiverReference(String receiverReference);

	public String getReceiverAddress();

	public void setReceiverAddress(String receiverAddress);

	public String getReceiverName();

	public void setReceiverName(String receiverName);

	public String getReceiverModeReference();

	public void setReceiverModeReference(String receiverModeReference);

	public String getSenderReference();

	public void setSenderReference(String senderReference);

	public String getSenderAddress();

	public void setSenderAddress(String senderAddress);

	public String getSenderModeReference();

	public void setSenderModeReference(String senderModeReference);

	public String getSenderOriginator();

	public void setSenderOriginator(String senderOriginator);
	
}