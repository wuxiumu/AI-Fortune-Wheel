<?php
/**
 * 明星数据控制器
 * GET /api/stars          获取所有明星
 * GET /api/stars/search   搜索明星
 */
class StarsController
{
    /**
     * 获取所有明星
     */
    public static function list(): void
    {
        $stars = FileModel::dataGet('stars') ?: [];
        Response::ok([
            'count' => count($stars),
            'list' => $stars
        ]);
    }

    /**
     * 搜索明星
     */
    public static function search(): void
    {
        $keyword = Response::get('q', '');
        $stars = FileModel::dataGet('stars') ?: [];

        if (!$keyword) {
            Response::ok(['list' => array_slice($stars, 0, 20)]);
            return;
        }

        $keyword = mb_strtolower($keyword);
        $results = [];
        foreach ($stars as $star) {
            if (mb_strpos(mb_strtolower($star['name']), $keyword) !== false) {
                $results[] = $star;
                if (count($results) >= 20) break;
            }
            foreach ($star['tags'] as $tag) {
                if (mb_strpos(mb_strtolower($tag), $keyword) !== false) {
                    $results[] = $star;
                    if (count($results) >= 20) break 2;
                }
            }
        }

        Response::ok(['list' => $results, 'keyword' => $keyword]);
    }
}
