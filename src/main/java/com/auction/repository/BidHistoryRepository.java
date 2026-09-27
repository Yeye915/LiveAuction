package com.auction.repository;

import com.auction.model.BidHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {

    @Query("SELECT MAX(b.bidAmount) FROM BidHistory b WHERE b.auctionId = :auctionId")
    Double findHighestBidByAuctionId(@Param("auctionId") Long auctionId);

    @Query("SELECT b.user.displayName FROM BidHistory b WHERE b.auctionId = :auctionId ORDER BY b.bidAmount DESC LIMIT 1")
    String findHighestBidderByAuctionId(@Param("auctionId") Long auctionId);
}