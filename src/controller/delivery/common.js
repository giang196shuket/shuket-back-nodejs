const mutationDataDeliveryArea = (itemData) =>{
    return {
        ADDRESS_NAME:  itemData.ADDRESS_NAME,
        ADDRESS_NAME2:  itemData.ADDRESS_NAME2,
        BUILDING_NAME:  itemData.BUILDING_NAME,
        MAIN_BUILDING_NO:  itemData.MAIN_BUILDING_NO,
        PROVINCE:  itemData.PROVINCE,
        CITY:  itemData.CITY,
        WARD:  itemData.WARD,
        ROAD_NAME:  itemData.ROAD_NAME,
        SUB_BUILDING_NO:  itemData.SUB_BUILDING_NO,
        ZONE_NO:  itemData.ZONE_NO,
        ADDRESS_X:  itemData.ADDRESS_X,
        ADDRESS_Y:  itemData.ADDRESS_Y,
        PLACE_URL:  itemData.PLACE_URL,
        MAP_KAKAO_ID:  itemData.MAP_KAKAO_ID,
    }
}
const returnDataAddresDetailChild = (addr, ad) =>{
    return {
        ADDRESS_X: addr.x,
        ADDRESS_Y: addr.y,
        PLACE_NAME: addr.place_name,
        PLACE_URL: addr.place_url,
        ADDRESS_NAME: ad.address.address_name,
        ADDRESS_NAME2: ad.road_address.address_name,
        BUILDING_NAME: ad.road_address.building_name,
        MAIN_BUILDING_NO: ad.road_address.main_building_no,
        PROVINCE: ad.road_address.region_1depth_name,
        CITY: ad.road_address.region_2depth_name,
        WARD: ad.road_address.region_3depth_name,
        ROAD_NAME: ad.road_address.road_name,
        SUB_BUILDING_NO: ad.road_address.sub_building_no,
        ZONE_NO: ad.road_address.zone_no,
        MAP_KAKAO_ID: addr.id,
        id: addr.id, // cho FE xài cái checkbox
    }
}
module.exports = {
    returnDataAddresDetailChild,
    mutationDataDeliveryArea
}