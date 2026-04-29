package com.inventory.backend.service;

import com.inventory.backend.model.Supplier;
import com.inventory.backend.model.User;
import com.inventory.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers(User user) {
        return supplierRepository.findByUser(user);
    }

    public Supplier getSupplierById(Long id, User user) {
        return supplierRepository.findById(id)
            .filter(s -> s.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    public Supplier createSupplier(Supplier supplier, User user) {
        supplier.setUser(user);
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier updated, User user) {
        Supplier supplier = getSupplierById(id, user);
        supplier.setName(updated.getName());
        supplier.setEmail(updated.getEmail());
        supplier.setPhone(updated.getPhone());
        supplier.setAddress(updated.getAddress());
        supplier.setContactPerson(updated.getContactPerson());
        supplier.setStatus(updated.getStatus());
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id, User user) {
        Supplier supplier = getSupplierById(id, user);
        supplierRepository.delete(supplier);
    }
}